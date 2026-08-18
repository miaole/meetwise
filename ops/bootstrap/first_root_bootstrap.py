#!/usr/bin/env python3
"""Independent first-root bootstrap for an attested preview controller.

This file lives outside ``ops/ecs`` and is deliberately excluded from the
controller archive.  It validates and extracts data; it never imports or
executes a candidate archive member.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import shutil
import stat
import subprocess
import sys
import tarfile
import uuid
from datetime import UTC, datetime
from pathlib import Path, PurePosixPath
from typing import BinaryIO

BOOTSTRAP_PARENT = Path("/var/lib/meetwise-preview-bootstrap")
FINAL_PREFIX = "verified-controller-"
PAYLOAD_ROOT = PurePosixPath("ops/ecs")
MAX_ARCHIVE_BYTES = 64 * 1024 * 1024
MAX_MEMBER_BYTES = 2 * 1024 * 1024
MAX_TOTAL_BYTES = 8 * 1024 * 1024
MAX_MEMBERS = 256
TRUSTED_GH = Path("/usr/bin/gh")
TRUSTED_PYTHON = Path("/usr/bin/python3.11")
APPROVAL_NAME = "controller-approval.json"
APPROVED_REPOSITORY = "miaole/meetwise"
APPROVED_SIGNER_WORKFLOW = "miaole/meetwise/.github/workflows/build-preview-web.yml@refs/heads/main"


class BootstrapError(RuntimeError):
    pass


def fail(code: str) -> None:
    raise BootstrapError(code)


def fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def fsync_tree(root: Path) -> None:
    """Persist every extracted directory entry before publishing its receipt."""
    directories = [Path(directory) for directory, _, _ in os.walk(root, topdown=False, followlinks=False)]
    for directory in directories:
        fsync_directory(directory)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def secure_owner(path: Path, uid: int, gid: int, mode: int) -> None:
    if os.geteuid() == 0:
        os.chown(path, uid, gid)
    elif (uid, gid) != (os.geteuid(), os.getegid()):
        fail("bootstrap_cannot_set_required_owner")
    os.chmod(path, mode)


def assert_root_regular(path: Path) -> None:
    current = Path("/")
    for component in path.parts[1:]:
        current = current / component
        metadata = os.lstat(current)
        if stat.S_ISLNK(metadata.st_mode) or metadata.st_uid != 0 or metadata.st_gid != 0 or stat.S_IMODE(metadata.st_mode) & 0o022:
            fail(f"bootstrap_untrusted_tool_path:{current}")
    if not stat.S_ISREG(os.lstat(path).st_mode):
        fail(f"bootstrap_tool_not_regular:{path}")


def assert_root_directory(path: Path, mode: int) -> None:
    metadata = os.lstat(path)
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid != 0 or metadata.st_gid != 0 or stat.S_IMODE(metadata.st_mode) != mode:
        fail(f"bootstrap_directory_metadata_invalid:{path}")


def require_bootstrap_parent(parent: Path) -> None:
    if parent.exists():
        assert_root_directory(parent, 0o700)
        return
    parent.mkdir(mode=0o700, parents=True)
    secure_owner(parent, 0, 0, 0o700)
    assert_root_directory(parent, 0o700)
    fsync_directory(parent.parent)


def require_gh_config(parent: Path) -> Path:
    """Use only the dedicated, root-owned GitHub CLI configuration."""
    config = parent / "gh-config"
    assert_root_directory(config, 0o700)
    hosts = config / "hosts.yml"
    metadata = os.lstat(hosts)
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode) or metadata.st_uid != 0 or metadata.st_gid != 0 or stat.S_IMODE(metadata.st_mode) != 0o600:
        fail("bootstrap_gh_config_invalid")
    return config


def sha256_text(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def verified_controller_slot(archive_sha256: str) -> Path:
    """Return the immutable, receipt-bound controller staging directory.

    A controller archive is never overwritten in place.  Replacements use a
    different digest-derived slot, which lets the installer prove that its
    own payload and receipt describe the same artifact while preserving an
    earlier root-verified slot for investigation or rollback.
    """
    return BOOTSTRAP_PARENT / f"{FINAL_PREFIX}{archive_sha256}"


def read_approval_descriptor(parent: Path) -> tuple[dict, str]:
    """Read the fixed, root-approved trust target without caller-controlled IDs."""
    descriptor = parent / APPROVAL_NAME
    metadata = os.lstat(descriptor)
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode) or metadata.st_uid != 0 or metadata.st_gid != 0 or stat.S_IMODE(metadata.st_mode) != 0o600:
        fail("bootstrap_approval_descriptor_invalid")
    try:
        raw = descriptor.read_bytes()
        value = json.loads(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise BootstrapError("bootstrap_approval_descriptor_invalid") from error
    required = {"schemaVersion", "repository", "signerWorkflow", "archiveSha256", "commit", "runId", "validatorSha256", "approvedSourceCommit"}
    if not isinstance(value, dict) or set(value) != required or value.get("schemaVersion") != 1:
        fail("bootstrap_approval_descriptor_invalid")
    if value["repository"] != APPROVED_REPOSITORY or value["signerWorkflow"] != APPROVED_SIGNER_WORKFLOW:
        fail("bootstrap_approval_descriptor_untrusted_source")
    if not isinstance(value["archiveSha256"], str) or len(value["archiveSha256"]) != 64 or any(character not in "0123456789abcdef" for character in value["archiveSha256"]):
        fail("bootstrap_approval_descriptor_invalid")
    if not isinstance(value["validatorSha256"], str) or len(value["validatorSha256"]) != 64 or any(character not in "0123456789abcdef" for character in value["validatorSha256"]):
        fail("bootstrap_approval_descriptor_invalid")
    if not isinstance(value["commit"], str) or len(value["commit"]) != 40 or any(character not in "0123456789abcdef" for character in value["commit"]):
        fail("bootstrap_approval_descriptor_invalid")
    if value["approvedSourceCommit"] != value["commit"] or not isinstance(value["runId"], str) or not value["runId"].isdigit():
        fail("bootstrap_approval_descriptor_invalid")
    return value, sha256_text(raw)


def open_untrusted_input(path: Path) -> int:
    """Open one bounded regular archive without trusting its pathname again.

    The remote upload directory is untrusted.  The descriptor, rather than a
    later pathname re-open, is therefore the object copied into root staging.
    ``O_NONBLOCK`` makes a FIFO fail at ``fstat`` instead of blocking root.
    """
    if not hasattr(os, "O_NOFOLLOW"):
        fail("bootstrap_nofollow_unsupported")
    flags = os.O_RDONLY | os.O_CLOEXEC | os.O_NONBLOCK | os.O_NOFOLLOW
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise BootstrapError("bootstrap_input_archive_invalid") from error
    try:
        metadata = os.fstat(descriptor)
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_size <= 0 or metadata.st_size > MAX_ARCHIVE_BYTES:
            fail("bootstrap_input_archive_invalid")
        return descriptor
    except BaseException:
        os.close(descriptor)
        raise


def copy_to_root_staging(source_descriptor: int, destination: Path, expected_sha256: str) -> str:
    temporary = destination.with_suffix(".tmp")
    copied = 0
    try:
        with os.fdopen(source_descriptor, "rb", buffering=0, closefd=True) as reader, temporary.open("xb", buffering=0) as writer:
            while chunk := reader.read(1024 * 1024):
                copied += len(chunk)
                if copied > MAX_ARCHIVE_BYTES:
                    fail("bootstrap_input_archive_invalid")
                writer.write(chunk)
            if copied == 0:
                fail("bootstrap_input_archive_invalid")
            writer.flush()
            os.fsync(writer.fileno())
        secure_owner(temporary, 0, 0, 0o600)
        actual = sha256_file(temporary)
        if actual != expected_sha256:
            fail("bootstrap_archive_sha256_mismatch")
        os.replace(temporary, destination)
        fsync_directory(destination.parent)
        return actual
    except BaseException:
        temporary.unlink(missing_ok=True)
        raise


def normalise_member(name: str) -> PurePosixPath:
    if not name or name.startswith("/") or "\\" in name or "\x00" in name or "\r" in name or "\n" in name:
        fail("bootstrap_archive_member_path_invalid")
    raw = name[:-1] if name.endswith("/") else name
    if not raw or any(part in {"", ".", ".."} for part in raw.split("/")):
        fail("bootstrap_archive_member_path_invalid")
    path = PurePosixPath(name.rstrip("/"))
    if not path.parts or any(part in {"", ".", ".."} for part in path.parts):
        fail("bootstrap_archive_member_path_invalid")
    if path != PAYLOAD_ROOT and PAYLOAD_ROOT not in path.parents:
        fail("bootstrap_archive_member_outside_payload")
    return path


def destination_for(root: Path, member: PurePosixPath) -> Path:
    destination = root.joinpath(*member.parts)
    try:
        destination.relative_to(root)
    except ValueError as error:
        raise BootstrapError("bootstrap_archive_member_outside_payload") from error
    return destination


def copy_member(reader: BinaryIO, destination: Path, size: int, uid: int, gid: int) -> None:
    destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with destination.open("xb", buffering=0) as writer:
        remaining = size
        while remaining:
            chunk = reader.read(min(1024 * 1024, remaining))
            if not chunk:
                fail("bootstrap_archive_member_truncated")
            writer.write(chunk)
            remaining -= len(chunk)
        writer.flush()
        os.fsync(writer.fileno())
    secure_owner(destination, uid, gid, 0o600)


def verify_extracted_tree(root: Path, uid: int, gid: int) -> None:
    for directory, child_directories, child_files in os.walk(root, topdown=True, followlinks=False):
        for candidate in [Path(directory), *(Path(directory) / name for name in [*child_directories, *child_files])]:
            metadata = os.lstat(candidate)
            if stat.S_ISLNK(metadata.st_mode) or not (stat.S_ISDIR(metadata.st_mode) or stat.S_ISREG(metadata.st_mode)):
                fail("bootstrap_payload_special_entry")
            if metadata.st_uid != uid or metadata.st_gid != gid or stat.S_IMODE(metadata.st_mode) & 0o022:
                fail("bootstrap_payload_entry_metadata_invalid")


def payload_tree_sha256(root: Path) -> str:
    rows: list[bytes] = []
    for path in sorted((item for item in root.rglob("*") if item.is_file()), key=lambda item: os.fsencode(item.relative_to(root))):
        # Match the controller installer's exact `find -P .` byte stream.
        # pathlib normalises `Path('.') / relative` and would drop this prefix.
        relative = b"./" + os.fsencode(path.relative_to(root))
        rows.append(f"{sha256_file(path)}  ".encode("ascii") + relative + b"\n")
    return hashlib.sha256(b"".join(rows)).hexdigest()


def extract_regular_controller_payload(archive: Path, destination: Path, *, uid: int, gid: int) -> tuple[int, int]:
    seen: set[PurePosixPath] = set()
    total_bytes = 0
    count = 0
    destination.mkdir(mode=0o700)
    secure_owner(destination, uid, gid, 0o700)
    try:
        with gzip.open(archive, "rb") as compressed:
            with tarfile.open(fileobj=compressed, mode="r|") as package:
                if package.pax_headers:
                    fail("bootstrap_archive_pax_rejected")
                for member in package:
                    count += 1
                    if count > MAX_MEMBERS:
                        fail("bootstrap_archive_member_limit")
                    if member.pax_headers or member.type not in {tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE}:
                        fail("bootstrap_archive_nonregular_member")
                    path = normalise_member(member.name)
                    if path in seen:
                        fail("bootstrap_archive_duplicate_member")
                    seen.add(path)
                    if member.size < 0 or member.size > MAX_MEMBER_BYTES:
                        fail("bootstrap_archive_member_size_invalid")
                    total_bytes += member.size
                    if total_bytes > MAX_TOTAL_BYTES:
                        fail("bootstrap_archive_total_size_invalid")
                    output = destination_for(destination, path)
                    if member.isdir():
                        output.mkdir(mode=0o700, parents=True, exist_ok=False)
                        secure_owner(output, uid, gid, 0o700)
                    else:
                        extracted = package.extractfile(member)
                        if extracted is None:
                            fail("bootstrap_archive_member_missing")
                        with extracted:
                            copy_member(extracted, output, member.size, uid, gid)
    except (OSError, EOFError, tarfile.TarError, gzip.BadGzipFile) as error:
        raise BootstrapError("bootstrap_archive_invalid") from error
    if PAYLOAD_ROOT not in seen or not destination_for(destination, PAYLOAD_ROOT).is_dir():
        fail("bootstrap_archive_payload_root_missing")
    verify_extracted_tree(destination, uid, gid)
    fsync_tree(destination)
    return count, total_bytes


def verify_attestation(archive: Path, approval: dict, gh_config: Path) -> dict:
    result = subprocess.run(
        [str(TRUSTED_GH), "attestation", "verify", str(archive), "--repo", APPROVED_REPOSITORY, "--signer-workflow", APPROVED_SIGNER_WORKFLOW, "--format", "json"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        env={"HOME": "/root", "GH_CONFIG_DIR": str(gh_config), "PATH": "/usr/bin:/bin", "LANG": "C.UTF-8"}, cwd="/", timeout=90,
    )
    try:
        record = json.loads(result.stdout)[0]
        certificate = record["verificationResult"]["signature"]["certificate"]
        subjects = record["verificationResult"]["statement"]["subject"]
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
        raise BootstrapError("bootstrap_attestation_result_invalid") from error
    has_subject = any(subject.get("name") == "meetwise-preview-controller.tar.gz" and subject.get("digest", {}).get("sha256") == approval["archiveSha256"] for subject in subjects)
    run_prefix = f"https://github.com/{APPROVED_REPOSITORY}/actions/runs/{approval['runId']}/"
    if not has_subject or certificate.get("githubWorkflowRepository") != APPROVED_REPOSITORY or certificate.get("githubWorkflowSHA") != approval["commit"] or certificate.get("githubWorkflowRef") != "refs/heads/main" or not str(certificate.get("runInvocationURI", "")).startswith(run_prefix):
        fail("bootstrap_attestation_binding_invalid")
    return record


def write_json_atomic(path: Path, value: dict) -> None:
    temporary = path.with_suffix(".tmp")
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            json.dump(value, handle, sort_keys=True, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
    except BaseException:
        temporary.unlink(missing_ok=True)
        raise
    secure_owner(temporary, 0, 0, 0o600)
    os.replace(temporary, path)
    fsync_directory(path.parent)


def bootstrap(arguments: argparse.Namespace) -> Path:
    # The root runbook must invoke this file with `/usr/bin/python3.11 -I`
    # under env -i.  This guard executes before we touch approval or archive
    # data; the fixed invocation itself prevents import-time injection.
    if not (sys.flags.isolated and sys.flags.ignore_environment and sys.flags.no_user_site):
        fail("bootstrap_python_isolation_required")
    if os.geteuid() != 0:
        fail("bootstrap_requires_root")
    if Path(sys.executable).resolve() != TRUSTED_PYTHON:
        fail("bootstrap_python_interpreter_untrusted")
    for tool in (TRUSTED_GH, TRUSTED_PYTHON):
        assert_root_regular(tool)
    input_archive = Path(arguments.input_archive)
    require_bootstrap_parent(BOOTSTRAP_PARENT)
    approval, approval_descriptor_sha256 = read_approval_descriptor(BOOTSTRAP_PARENT)
    validator_path = Path(__file__).resolve()
    validator_sha256 = sha256_file(validator_path)
    if validator_sha256 != approval["validatorSha256"]:
        fail("bootstrap_validator_sha256_mismatch")
    gh_config = require_gh_config(BOOTSTRAP_PARENT)
    final = verified_controller_slot(approval["archiveSha256"])
    if final.exists() or final.is_symlink():
        fail("bootstrap_already_published")
    stage = BOOTSTRAP_PARENT / f".staging-{uuid.uuid4().hex}"
    stage.mkdir(mode=0o700)
    secure_owner(stage, 0, 0, 0o700)
    try:
        archive = stage / "controller.tar.gz"
        source_descriptor = open_untrusted_input(input_archive)
        archive_sha256 = copy_to_root_staging(source_descriptor, archive, approval["archiveSha256"])
        attestation = verify_attestation(archive, approval, gh_config)
        write_json_atomic(stage / "attestation.json", attestation)
        payload = stage / "payload"
        entry_count, uncompressed_bytes = extract_regular_controller_payload(archive, payload, uid=0, gid=0)
        receipt = {
            "schemaVersion": 2, "bootstrapSlot": final.name,
            "archiveSha256": archive_sha256, "payloadTreeSha256": payload_tree_sha256(payload),
            "attestationVerifiedAt": datetime.now(UTC).isoformat(), "expectedArchiveSha256": approval["archiveSha256"],
            "repository": APPROVED_REPOSITORY, "signerWorkflow": APPROVED_SIGNER_WORKFLOW, "workflowCommit": approval["commit"],
            "runId": approval["runId"], "archivePolicy": "bootstrap-controller-v1:regular-files-only",
            "archiveEntryCount": entry_count, "archiveUncompressedBytes": uncompressed_bytes,
            "validatorPath": str(validator_path), "validatorSha256": validator_sha256,
            "expectedValidatorSha256": approval["validatorSha256"], "approvalDescriptorSha256": approval_descriptor_sha256,
            "targetHostname": os.uname().nodename, "createdAt": datetime.now(UTC).isoformat(),
        }
        write_json_atomic(stage / "bootstrap.json", receipt)
        fsync_directory(stage)
        os.rename(stage, final)
        fsync_directory(BOOTSTRAP_PARENT)
        return final
    except BaseException:
        if stage.exists():
            shutil.rmtree(stage)
            fsync_directory(BOOTSTRAP_PARENT)
        raise


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="root-only first bootstrap for an attested preview controller archive")
    parser.add_argument("--input-archive", required=True)
    return parser.parse_args()


if __name__ == "__main__":
    try:
        print(bootstrap(parse_arguments()))
    except (BootstrapError, subprocess.SubprocessError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(70)

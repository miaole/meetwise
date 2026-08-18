#!/usr/bin/env python3
"""Pure archive-policy checks; no candidate archive code is executed."""

from __future__ import annotations

import io
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path
import sys

import first_root_bootstrap as bootstrap
from first_root_bootstrap import BootstrapError, copy_to_root_staging, extract_regular_controller_payload, open_untrusted_input, payload_tree_sha256, sha256_file


PINNED_VALIDATOR_SHA256 = Path(__file__).with_name("first-root-bootstrap.sha256").read_text(encoding="utf-8").split()[0]
assert PINNED_VALIDATOR_SHA256 == sha256_file(Path(__file__).with_name("first_root_bootstrap.py"))
assert bootstrap.verified_controller_slot("a" * 64).name == f"verified-controller-{'a' * 64}"


def add_directory(package: tarfile.TarFile, name: str) -> None:
    item = tarfile.TarInfo(name)
    item.type = tarfile.DIRTYPE
    package.addfile(item)


def add_file(package: tarfile.TarFile, name: str, body: bytes) -> None:
    item = tarfile.TarInfo(name)
    item.size = len(body)
    package.addfile(item, io.BytesIO(body))


with tempfile.TemporaryDirectory(prefix="meetwise-bootstrap-proof-") as temporary:
    root = Path(temporary)
    uid, gid = os.geteuid(), os.getegid()
    good = root / "good.tar.gz"
    with tarfile.open(good, "w:gz") as package:
        add_directory(package, "ops/ecs")
        add_file(package, "ops/ecs/controller-files.txt", b"controller-lib.sh\tcontroller-lib.sh\n")
        add_file(package, "ops/ecs/controller-lib.sh", b"#!/bin/sh\nexit 0\n")
    count, total = extract_regular_controller_payload(good, root / "good", uid=uid, gid=gid)
    assert count == 3 and total > 0 and len(payload_tree_sha256(root / "good")) == 64
    installer_digest = subprocess.check_output([
        "sh", "-c",
        "cd \"$1\" && find -P . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}'",
        "sh", str(root / "good"),
    ], text=True).strip()
    assert payload_tree_sha256(root / "good") == installer_digest

    # Once the descriptor is acquired, an uploader replacing the pathname
    # cannot change the bytes copied into root staging.
    source = root / "upload.tar.gz"
    source.write_bytes(good.read_bytes())
    descriptor = open_untrusted_input(source)
    expected_source_digest = sha256_file(source)
    source.unlink()
    source.symlink_to("/etc/passwd")
    staging = root / "staging"
    staging.mkdir()
    original_secure_owner = bootstrap.secure_owner
    bootstrap.secure_owner = lambda path, _uid, _gid, mode: os.chmod(path, mode)
    try:
        assert copy_to_root_staging(descriptor, staging / "controller.tar.gz", expected_source_digest) == expected_source_digest
        assert sha256_file(staging / "controller.tar.gz") == expected_source_digest
    finally:
        bootstrap.secure_owner = original_secure_owner

    # A FIFO must be rejected without allowing root to block on its reader.
    fifo = root / "upload.fifo"
    os.mkfifo(fifo)
    try:
        open_untrusted_input(fifo)
        raise AssertionError("FIFO input was accepted")
    except BootstrapError as error:
        assert "input_archive_invalid" in str(error)

    # Keep the test small while proving the bounded-size predicate.
    oversized = root / "oversized.tar.gz"
    oversized.write_bytes(b"x" * 17)
    previous_limit = bootstrap.MAX_ARCHIVE_BYTES
    bootstrap.MAX_ARCHIVE_BYTES = 16
    try:
        open_untrusted_input(oversized)
        raise AssertionError("oversized input was accepted")
    except BootstrapError as error:
        assert "input_archive_invalid" in str(error)
    finally:
        bootstrap.MAX_ARCHIVE_BYTES = previous_limit

    # The mandated `-I` launch ignores an attacker-controlled PYTHONPATH
    # before this module imports gzip or any other standard-library helper.
    poison = root / "poison"
    poison.mkdir()
    sentinel = root / "pythonpath-was-imported"
    (poison / "gzip.py").write_text(
        f"from pathlib import Path\nPath({str(sentinel)!r}).write_text('poison')\n",
        encoding="utf-8",
    )
    isolated = subprocess.run(
        [sys.executable, "-I", str(Path(__file__).with_name("first_root_bootstrap.py")), "--input-archive", "/definitely/not-an-archive"],
        env={"PYTHONPATH": str(poison), "PATH": os.environ["PATH"]},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    assert isolated.returncode != 0 and not sentinel.exists()

    traversal = root / "traversal.tar.gz"
    with tarfile.open(traversal, "w:gz") as package:
        add_directory(package, "ops/ecs")
        add_file(package, "ops/ecs/../../outside", b"no")
    try:
        extract_regular_controller_payload(traversal, root / "traversal", uid=uid, gid=gid)
        raise AssertionError("traversal archive was accepted")
    except BootstrapError as error:
        assert "path_invalid" in str(error)

    noncanonical = root / "noncanonical.tar.gz"
    with tarfile.open(noncanonical, "w:gz") as package:
        add_directory(package, "ops//ecs")
    try:
        extract_regular_controller_payload(noncanonical, root / "noncanonical", uid=uid, gid=gid)
        raise AssertionError("noncanonical archive path was accepted")
    except BootstrapError as error:
        assert "path_invalid" in str(error)

    symlink = root / "symlink.tar.gz"
    with tarfile.open(symlink, "w:gz") as package:
        add_directory(package, "ops/ecs")
        entry = tarfile.TarInfo("ops/ecs/link")
        entry.type = tarfile.SYMTYPE
        entry.linkname = "controller-lib.sh"
        package.addfile(entry)
    try:
        extract_regular_controller_payload(symlink, root / "symlink", uid=uid, gid=gid)
        raise AssertionError("symlink archive was accepted")
    except BootstrapError as error:
        assert "nonregular" in str(error)

print("✓ first-root bootstrap archive policy 9/9 assertions passed; no candidate code executed")

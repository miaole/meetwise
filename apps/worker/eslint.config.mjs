// LINT-DESIGN §1.5 S2 指针：薄壳 re-export base·零调参（规则唯一授权面 = packages/config/eslint.config.base.mjs）
// 相对路径落法：实树零 workspace 声明 @meetwise/config 依赖（specifier ERR_MODULE_NOT_FOUND 亲证）·沿 tsconfig extends 相对惯例
import base from '../../packages/config/eslint.config.base.mjs';
export default base;

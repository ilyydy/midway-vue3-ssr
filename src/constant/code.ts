// 错误码映射
export const RESPONSE_CODE = {
  SUCCESS: 0,
  FAIL: 500,
  PARAM_ERROR: 10001, // 参数错误
} as const;

// 错误信息
export const CODE_MESSAGES = {
  [RESPONSE_CODE.SUCCESS]: 'Ok',
  [RESPONSE_CODE.FAIL]: 'Fail',
  [RESPONSE_CODE.PARAM_ERROR]: 'Params error',
} as const;

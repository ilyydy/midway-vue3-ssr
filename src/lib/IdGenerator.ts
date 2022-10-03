export default class IdGenerator {
  /** 开始时间截 */
  private startTime: number;

  /** 机器id */
  private workerId: number;

  /** 机器id所占的位数 */
  public static readonly workerIdBits = 5;

  /** 支持的最大机器id */
  public static readonly maxWorkerId = -1 ^ (-1 << this.workerIdBits);

  /** 毫秒内序列 */
  private sequence: number;

  /** 序列在id中占的位数 */
  public static readonly sequenceBits = 12;

  public static readonly sequenceMask = -1 ^ (-1 << this.sequenceBits);

  /** 机器ID向左移位数 */
  public static readonly workerIdShift = this.sequenceBits;

  /** 时间截向左移位数 */
  public static readonly timestampLeftShift =
    this.sequenceBits + this.workerIdBits;

  /** 上次生成ID的时间截 */
  private lastTimestamp = 0;

  constructor(
    workerId: number,
    startTime = new Date('2022-10-03T00:00:00.000Z').getTime()
  ) {
    this.workerId = workerId;
    this.startTime = startTime;

    // workerId 校验
    if (this.workerId > IdGenerator.maxWorkerId || this.workerId < 0) {
      throw new Error(
        `workerId must max than 0 and small than maxWorkerId ${IdGenerator.maxWorkerId}`
      );
    }
  }

  nextId() {
    let timestamp = Date.now();

    //如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过这个时候应当抛出异常
    if (timestamp < this.lastTimestamp) {
      throw new Error(
        'Clock moved backwards. Refusing to generate id for ' +
          (this.lastTimestamp - timestamp)
      );
    }

    //如果是同一时间生成的，则进行毫秒内序列
    if (this.lastTimestamp === timestamp) {
      // 按位与操作 对于每一个比特位，只有两个操作数相应的比特位都是1时，结果才为1，否则为0
      this.sequence = (this.sequence + 1) & IdGenerator.sequenceMask;
      //毫秒内序列溢出
      if (this.sequence === 0) {
        //阻塞到下一个毫秒,获得新的时间戳
        timestamp = IdGenerator.tilNextMs(this.lastTimestamp);
      }
    } else {
      //时间戳改变，毫秒内序列重置
      this.sequence = 0;
    }

    //上次生成ID的时间截
    this.lastTimestamp = timestamp;

    //移位并通过或运算拼到一起组成64位的ID
    const result =
      (BigInt(timestamp - this.startTime) <<
        BigInt(IdGenerator.timestampLeftShift)) |
      BigInt(this.workerId << IdGenerator.workerIdShift) |
      BigInt(this.sequence);
    return result.toString();
  }

  private static tilNextMs(lastTimestamp: number) {
    let timestamp = Date.now();
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now();
    }

    return timestamp;
  }
}

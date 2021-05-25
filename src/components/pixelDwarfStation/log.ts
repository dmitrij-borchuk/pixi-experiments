import { EventEmitter } from 'events'
import { LogItem } from './logItem'

export class Log extends EventEmitter {
  static EVENT = {
    LOG: 'log',
  }
  public items: LogItem[] = []
  public add(item: LogItem) {
    this.items.push(item)
    this.emit(Log.EVENT.LOG, item)
  }
}

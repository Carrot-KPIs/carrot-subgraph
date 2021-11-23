/* eslint-disable prefer-const */

import { dataSource, log } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from './constants'

export function getFactoryAddress(): string {
  let network = dataSource.network() as string
  // not using a switch-case because using strings is not yet supported (only u32)
  if (network == 'rinkeby') return '0x6752241ee8420cb61a6ae6b666bd5759bfac6eb0'
  if (network == 'xdai') return '0xe82c4d8b993d613a28600b953e91a3a93ae69fd6'
  log.warning('no factory address for unsupported network {}', [network])
  return ADDRESS_ZERO
}

import { dataSource, log } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from './constants'

export function getFactoryAddress(): string {
  let network = dataSource.network() as string
  // not using a switch-case because using strings is not yet supported (only u32)
  if (network == 'rinkeby') return '0x5e02b60e676cf965deb29df522fe26f0c1d5d771'
  log.warning('no factory address for unsupported network {}', [network])
  return ADDRESS_ZERO
}

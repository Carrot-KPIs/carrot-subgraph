import { dataSource, log } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from './constants'

export function getFactoryAddress(): string {
  let network = dataSource.network() as string
  // not using a switch-case because using strings is not yet supported (only u32)
  if (network == 'rinkeby') return '0x74acc6c5a3ae974f8bbdf461ac0250a353a76499'
  log.warning('no factory address for unsupported network {}', [network])
  return ADDRESS_ZERO
}
import { dataSource, log } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO } from './constants'

export function getFactoryAddress(): string {
  let network = dataSource.network() as string
  // not using a switch-case because using strings is not yet supported (only u32)
  if (network == 'rinkeby') return '0xa60c831dc30a6564aa23044ade594c2f1e3c9929'
  log.warning('no factory address for unsupported network {}', [network])
  return ADDRESS_ZERO
}

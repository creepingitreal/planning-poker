import config from './config.json'
import logoUrl from './logo.svg?url'
import logoMarkUrl from './logo-mark.svg?url'

export const brand = {
  ...config,
  logoUrl,
  logoMarkUrl,
}

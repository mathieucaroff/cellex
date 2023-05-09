// https://github.com/lukewarlow/user-agent-data-types/blob/master/index.d.ts
// https://stackoverflow.com/a/71392474/9878263
//
// WICG Spec: https://wicg.github.io/ua-client-hints

declare interface Navigator {
  readonly userAgentData?: NavigatorUAData
}

// https://wicg.github.io/ua-client-hints/#dictdef-navigatoruabrandversion
interface NavigatorUABrandVersion {
  readonly brand: string
  readonly version: string
}

interface NavigatorUAData {
  readonly brands: NavigatorUABrandVersion[]
  readonly mobile: boolean
  readonly platform: string
}

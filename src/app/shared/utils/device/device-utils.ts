import { OperationalSystem } from "@utils/operational-system/operational-system.enum";
import { DeviceType } from "./device-type.enum";

export class DeviceUtils {
  static getOperacionalSystem(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    switch (true) {
      case /android/.test(userAgent):
        return DeviceType.ANDROID;
      case /webos/.test(userAgent):
        return DeviceType.WEB_OS;
      case /iphone/.test(userAgent):
        return DeviceType.IPHONE;
      case /ipad/.test(userAgent):
        return DeviceType.IPAD;
      case /ipod/.test(userAgent):
        return DeviceType.IPOD;
      case /blackberry/.test(userAgent):
        return DeviceType.BLACKBERRY;
      case /iemobile/.test(userAgent):
        return DeviceType.IE_MOBILE;
      case /opera mini/.test(userAgent):
        return DeviceType.OPERA_MINI;

      case platform.includes('android'):
      case platform.includes('iphone'):
      case platform.includes('ipad'):
        return platform;

      case userAgent.includes('windows nt 10.0'):
        return OperationalSystem.WINDOWS_10;
      case userAgent.includes('windows nt 6.2'):
        return OperationalSystem.WINDOWS_8;
      case userAgent.includes('windows nt 6.1'):
        return OperationalSystem.WINDOWS_7;
      case userAgent.includes('windows nt 6.0'):
        return OperationalSystem.WINDOWS_VISTA;
      case userAgent.includes('windows nt 5.1'):
        return OperationalSystem.WINDOWS_XP;
      case userAgent.includes('windows nt 5.0'):
        return OperationalSystem.WINDOWS_2000;
      case userAgent.includes('mac'):
        return OperationalSystem.MAC_IOS;
      case userAgent.includes('x11'):
        return OperationalSystem.UNIX;
      case userAgent.includes('linux'):
        return OperationalSystem.LINUX;
      default:
        return userAgent;
    }
  }
}

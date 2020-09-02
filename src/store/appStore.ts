import { Platform } from 'react-native';
import { observable, action, computed } from 'mobx';
import NetInfo from '@react-native-community/netinfo';
import { Keys, Storage, ItemKeys } from './localStorage';

class App {
    // 直播相关: 是否有足够的权限开启直播( 麦克风，摄像头 )
    @observable sufficient_permissions: boolean = false;

    @observable viewportHeight: number = Device.HEIGHT;
    @observable unreadMessages: number = 0;
    @observable deviceOffline: boolean = false;
    @observable connectionInfoType: Record<string, any> = {};
    @observable isFullScreen: boolean = false;
    @observable client: Record<string, any> = {};
    @observable echo: Record<string, any> = {};
    @observable modalIsShow: boolean = false;
    @observable currentRouteName: string = '';

    @observable createPostGuidance: boolean = true; // 用户引导,现在默认关闭
    @observable agreeCreatePostAgreement: boolean = false; // 用户协议观看记录
    @observable spiderVideo: boolean = false; // 是否已经采集过

    constructor() {
        this.recall();
        NetInfo.addEventListener(this.handleConnectivityChange);
    }

    @action.bound
    async recall() {
        // 现在默认关闭
        const agreeCreatePostAgreement = await Storage.getItem(Keys.agreeCreatePostAgreement);
        const spiderVideo = await Storage.getItem(Keys.spiderVideo);
        if (agreeCreatePostAgreement) {
            this.agreeCreatePostAgreement = true;
        }
        if (spiderVideo) {
            this.spiderVideo = true;
        }
    }

    @action.bound
    setAppStorage(key: keyof ItemKeys, value: any) {
        Storage.setItem(key, value);
    }

    @action.bound
    handleConnectivityChange(connectionInfo: any) {
        this.connectionInfoType = connectionInfo.type;
        this.deviceOffline = connectionInfo.type === 'none';
    }

    @action.bound
    setEcho(echo: any) {
        this.echo = echo;
    }

    // 关于直播更新 sufficient permissions
    @action.bound
    appSetSufficientPermissions(sufficient: boolean) {
        this.sufficient_permissions = sufficient;
    }

    // 记录已查看的版本更新提示
    @action.bound
    async updateViewedVesion(viewedVersion: string) {
        await Storage.setItem(Keys.viewedVersion, viewedVersion);
    }

    changeAppVersion(version: string) {
        Storage.setItem(Keys.appVersion, version);
    }
}

export default new App();

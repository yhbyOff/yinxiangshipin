/*
 * @Author: Gaoxuan
 * @Date:   2019-05-23 15:24:59
 */

import { NativeModules, Platform } from 'react-native';

class Share {
    static shareWechat(file) {
        return NativeModules.NativeShare.shareWechatFriend(file);
    }

    static shareTextWechatFriend(content) {
        return NativeModules.NativeShare.shareTextWechatFriend(content);
    }

    static shareWechatMoment(file) {
        return NativeModules.NativeShare.shareWechatMoment(file);
    }

    static shareImageToQQ(file) {
        return NativeModules.NativeShare.shareImageToQQ(file);
    }

    static shareTextToQQ(content) {
        return NativeModules.NativeShare.shareTextToQQ(content);
    }

    static shareImageToQQZone(file, title) {
        return NativeModules.NativeShare.shareImageToQQZone(file, title);
    }

    static shareToSinaFriends(file, title) {
        return NativeModules.NativeShare.shareToSinaFriends(file, title);
    }
}

export default Share;

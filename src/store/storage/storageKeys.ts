export const RecordKeys = {
    me: 'me',
    appVersion: 'appVersion',
    notFirstInstall: 'notFirstInstall',
    viewedVersion: 'viewedVersion',
    agreeCreatePostAgreement: 'agreeCreatePostAgreement',
    searchRecord: 'searchRecord',
    spiderVideoTaskGuided: 'spiderVideoTaskGuided',
    isLocalSpiderVideo: 'isLocalSpiderVideo',
    detectedFileInfo: 'detectedFileInfo',
} as const;

// 'UserAgreementGuide' + Config.Version
export const GuideKeys = {
    bindAccountRemind: 'bindAccountRemind',
    disabledBindAccountRemind: 'disabledBindAccountRemind',
    UserAgreementGuide: 'UserAgreementGuide',
    NewUserTask: 'NewUserTask',
} as const;

export type ItemKeys = typeof RecordKeys & typeof GuideKeys;

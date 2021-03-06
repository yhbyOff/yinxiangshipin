import React, { useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { NavBarHeader, Avatar, Badge, Row, SafeText, StatusView, FocusAwareStatusBar } from '@src/components';
import { GQL, useQuery } from '@src/apollo';
import { observer, userStore, appStore, adStore, notificationStore } from '@src/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Chats from './components/Chats';

const notifyTypes = [
    'unread_comments',
    'unread_likes',
    'unread_follows',
    'unread_others',
    'unread_tips',
    'unread_chat',
];

export default observer((props: any) => {
    const navigation = useNavigation();
    const user = userStore?.me;

    const { data, refetch, loading } = useQuery(GQL.chatsQuery, {
        fetchPolicy: 'network-only',
        variables: { user_id: user.id },
        skip: !user.id,
    });
    const chats = useMemo(() => (userStore.login ? data?.chats?.data : null), [data, userStore.login]);

    useEffect(() => {
        if (user.id) {
            const navBlurListener = navigation.addListener('focus', (payload) => {
                refetch && refetch();
            });
            return () => {
                navBlurListener();
            };
        }
    }, [user.id, refetch]);

    const authNavigator = useCallback(
        (route, params) => {
            if (userStore?.login) {
                navigation.navigate(route, params);
            } else {
                navigation.navigate('Login');
            }
        },
        [userStore?.login],
    );

    const PageFooter = useMemo(() => {
        if (Array.isArray(chats)) {
            if (chats.length < 1) {
                return (
                    <StatusView.EmptyView
                        title="若不寻人聊，只能待佳音"
                        imageSource={require('@app/assets/images/default/default_chat.png')}
                    />
                );
            }

            return (
                <View style={styles.footerView}>
                    <Text style={styles.footerViewText}>--end--</Text>
                </View>
            );
        } else if (!loading) {
            return (
                <StatusView.EmptyView
                    title="加入我们，认识更多小伙伴吧"
                    imageSource={require('@app/assets/images/default/default_chat.png')}
                />
            );
        }
    }, [chats, loading]);

    return (
        <View style={styles.container}>
            <FocusAwareStatusBar barStyle="dark-content" />
            <NavBarHeader
                title={'消息中心'}
                hasGoBackButton={adStore.enableWallet}
                centerStyle={{
                    marginHorizontal: pixel(12),
                }}
            />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.notifyList}>
                    <TouchableOpacity
                        style={styles.notifyItem}
                        onPress={() => authNavigator('CommentNotification', { user })}>
                        <Image
                            style={styles.notifyIcon}
                            source={require('@app/assets/images/icons/ic_message_comment.png')}
                        />
                        <View style={styles.itemContent}>
                            <SafeText style={styles.itemName}>评论</SafeText>
                        </View>
                        <View style={styles.pstBadge}>
                            <Badge count={notificationStore.unreadNotify.unread_comments} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.notifyItem}
                        onPress={() => authNavigator('BeLikedNotification', { user })}>
                        <Image
                            style={styles.notifyIcon}
                            source={require('@app/assets/images/icons/ic_message_like.png')}
                        />
                        <View style={styles.itemContent}>
                            <SafeText style={styles.itemName}>点赞</SafeText>
                        </View>
                        <View style={styles.pstBadge}>
                            <Badge count={notificationStore.unreadNotify.unread_likes} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.notifyItem}
                        onPress={() => authNavigator('FollowNotification', { user })}>
                        <Image
                            style={styles.notifyIcon}
                            source={require('@app/assets/images/icons/ic_message_follower.png')}
                        />
                        <View style={styles.itemContent}>
                            <SafeText style={styles.itemName}>粉丝</SafeText>
                        </View>
                        <View style={styles.pstBadge}>
                            <Badge count={notificationStore.unreadNotify.unread_follows} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notifyItem} onPress={() => authNavigator('PublicNotification')}>
                        <Image
                            style={styles.notifyIcon}
                            source={require('@app/assets/images/icons/ic_message_notify.png')}
                        />
                        <View style={styles.itemContent}>
                            <SafeText style={styles.itemName}>通知</SafeText>
                        </View>
                        <View style={styles.pstBadge}>
                            <Badge count={notificationStore.unreadNotify.unread_others} />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.messageItem}
                    activeOpacity={1}
                    onPress={() => authNavigator('PersonalNotification')}>
                    <Avatar source={require('@app/assets/images/app_logo.png')} size={pixel(46)} />
                    <View style={styles.messageContent}>
                        <View style={styles.messageContentTop}>
                            <SafeText style={styles.messageName}>{Config.AppName}</SafeText>
                            <View style={styles.officialLabel}>
                                <SafeText style={styles.officialLabelName}>官方</SafeText>
                            </View>
                        </View>
                        <View style={styles.messageContentBottom}>
                            <SafeText style={styles.lastMessage} numberOfLines={1}>
                                您的专属小贴士
                            </SafeText>
                            <Badge count={notificationStore.unreadNotify.unread_tips} />
                        </View>
                    </View>
                </TouchableOpacity>
                <Chats chats={chats} />
                {PageFooter}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        backgroundColor: Theme.groundColour,
        flexGrow: 1,
        paddingBottom: Device.bottomInset || pixel(15),
    },
    notifyList: {
        backgroundColor: '#fff',
        overflow: 'hidden',
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#f4f4f4',
    },
    notifyItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        flexDirection: 'column',
        padding: pixel(Theme.edgeDistance),
    },
    notifyIcon: {
        width: pixel(42),
        height: pixel(42),
    },
    itemContent: {
        marginTop: pixel(10),
    },
    pstBadge: {
        position: 'absolute',
        top: pixel(8),
        right: pixel(10),
    },
    itemName: {
        color: Theme.defaultTextColor,
        fontSize: font(14),
    },
    messageItem: {
        height: pixel(70),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: pixel(Theme.edgeDistance),
    },
    messageContent: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        marginLeft: pixel(10),
        paddingVertical: pixel(8),
        borderBottomWidth: Device.minimumPixel,
        borderBottomColor: '#f0f0f0',
    },
    messageContentTop: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageContentBottom: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    messageName: {
        color: Theme.defaultTextColor,
        fontSize: font(15),
        fontWeight: 'bold',
    },
    officialLabel: {
        backgroundColor: '#FFEBEE',
        width: pixel(30),
        height: font(18),
        marginLeft: pixel(4),
        borderRadius: pixel(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    officialLabelName: {
        color: Theme.primaryColor,
        fontSize: font(10),
        lineHeight: font(14),
    },
    lastMessage: {
        color: Theme.subTextColor,
        fontSize: font(12),
        lineHeight: font(14),
        paddingRight: pixel(20),
    },
    timeAgo: {
        color: Theme.subTextColor,
        fontSize: font(12),
    },
    footerView: {
        alignItems: 'center',
        flexDirection: 'row',
        height: pixel(40),
        justifyContent: 'center',
    },
    footerViewText: {
        color: '#a0a0a0',
        fontSize: font(14),
    },
});

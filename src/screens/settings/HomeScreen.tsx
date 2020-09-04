import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { PageContainer, Iconfont, ListItem, ItemSeparator, PopOverlay, Loading } from '@src/components';
import { checkUpdate } from '@src/common';
import { userStore, appStore } from '@src/store';
import { useNavigation } from '@react-navigation/native';
import { GQL, errorMessage } from '@src/apollo';

export default (props: any) => {
    const navigation = useNavigation();

    const signOut = useCallback(() => {
        if (userStore.me?.phone) {
            PopOverlay({
                content: '确定退出登录吗?',
                onConfirm: async () => {
                    userStore.signOut();
                    navigation.navigate('Main', null, navigation.navigate('Profile'));
                },
            });
        } else {
            PopOverlay({
                content: '账号未绑定，退出登录可能会丢失数据！可在【设置】中绑定手机号',
                leftContent: '确认退出',
                rightContent: '前去绑定',
                leftConfirm: async () => {
                    userStore.signOut();
                    navigation.navigate('Main', null, navigation.navigate('Profile'));
                },
                onConfirm: async () => {
                    navigation.navigate('BindingAccount');
                },
            });
        }
    }, []);

    const destroyAccount = useCallback(() => {
        async function destroyUser() {
            Loading.show();
            try {
                await appStore.client.mutate({
                    mutation: GQL.destroyUserMutation,
                });
                userStore.signOut();
                Toast.show({ content: '注销成功' });
                navigation.navigate('Main', null, navigation.navigate('Profile'));
            } catch (error) {
                Toast.show({ content: errorMessage(error) || '注销失败' });
            }
            Loading.hide();
        }
        PopOverlay({
            content: '注销后该账号将无法登录，确认注销吗？',
            leftContent: '我在想想',
            rightContent: '确认注销',
            onConfirm: destroyUser,
        });
    }, []);

    return (
        <PageContainer title="设置" white>
            <ScrollView
                style={styles.container}
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: pixel(20),
                }}>
                {userStore.login && (
                    <>
                        <ItemSeparator />
                        <ListItem
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.listItem}
                            leftComponent={
                                <View style={styles.UserComment}>
                                    <Image source={{ uri: userStore.me.avatar }} style={styles.avatarImage} />
                                    <Text style={styles.avatarName}>{userStore.me.name}</Text>
                                </View>
                            }
                            rightComponent={
                                <View style={styles.UserComment}>
                                    <Text style={styles.informationUser}>个人信息</Text>
                                    <Iconfont name="right" size={pixel(14)} color={Theme.subTextColor} />
                                </View>
                            }
                        />
                        <ItemSeparator />
                        <ListItem
                            onPress={() => navigation.navigate('AccountSecurity')}
                            style={styles.listItem}
                            leftComponent={<Text style={styles.itemText}>账号绑定</Text>}
                            rightComponent={<Iconfont name="right" size={pixel(14)} color={Theme.subTextColor} />}
                        />
                        <ItemSeparator />
                        <ListItem
                            onPress={destroyAccount}
                            style={styles.listItem}
                            leftComponent={<Text style={styles.itemText}>账号注销</Text>}
                        />
                        <ItemSeparator />
                        <ListItem
                            onPress={() => navigation.navigate('UserBlockList')}
                            style={styles.listItem}
                            leftComponent={<Text style={styles.itemText}>黑名单</Text>}
                            rightComponent={<Iconfont name="right" size={pixel(14)} color={Theme.subTextColor} />}
                        />
                    </>
                )}
                <ItemSeparator />
                <ListItem
                    onPress={checkUpdate}
                    style={styles.listItem}
                    leftComponent={<Text style={styles.itemText}>检查更新</Text>}
                    rightComponent={<Text style={styles.rigthText}> {Config.Version} </Text>}
                />
                <ItemSeparator />
                <ListItem
                    onPress={() => navigation.navigate('VersionInformation')}
                    style={styles.listItem}
                    leftComponent={<Text style={styles.itemText}>其他</Text>}
                    rightComponent={<Iconfont name="right" size={pixel(14)} color={Theme.subTextColor} />}
                />
                <ItemSeparator />
                {userStore.login && (
                    <TouchableOpacity
                        style={[
                            styles.listItem,
                            {
                                justifyContent: 'center',
                            },
                        ]}
                        onPress={signOut}>
                        <Text style={styles.logout}>退出登录</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    UserComment: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    avatarImage: {
        width: pixel(40),
        height: pixel(40),
        borderRadius: pixel(20),
    },
    avatarName: {
        color: 'rgba(0, 0, 0, 1)',
        fontSize: font(16),
        fontWeight: 'bold',
        marginLeft: pixel(15),
    },
    container: {
        backgroundColor: Theme.groundColour,
        flex: 1,
    },
    informationUser: {
        color: 'rgba(0, 0, 0, 0.3)',
        fontSize: font(16),
        marginRight: pixel(10),
    },
    itemText: {
        color: Theme.defaultTextColor,
        fontSize: font(15),
        marginRight: pixel(15),
    },
    listItem: {
        backgroundColor: '#fff',
        height: pixel(50),
        paddingHorizontal: pixel(16),
    },
    logout: {
        alignSelf: 'center',
        color: Theme.primaryColor,
        fontSize: font(14),
    },
    rigthText: {
        color: Theme.subTextColor,
        fontSize: font(14),
    },
});

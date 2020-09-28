import React, { useRef, useMemo, useEffect, useCallback, ReactElement } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    ImageBackground,
    TouchableOpacity,
    DeviceEventEmitter,
    BackHandler,
    FlatListProperties,
    ViewStyle,
} from 'react-native';
import { ad } from 'react-native-ad';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Iconfont } from '@src/components';
import { observer, adStore } from '@src/store';
import { GQL, useApolloClient } from '@src/apollo';
import VideoItem from './components/VideoItem';
import CommentOverlay from '@src/screens/comment/CommentOverlay';
import CommentInput from './components/CommentInput';
import useAdReward from './components/useAdReward';
import RewardProgress from './components/RewardProgress';
import __ from 'lodash';

const config = {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 95,
};

interface Props extends FlatListProperties {
    store: any;
    initialIndex?: number;
    getVisibleItem: (i: number) => void;
    fetchData: () => void;
    showBottomInput?: boolean;
    EmptyComponent?: ReactElement;
    rewardEnable?: boolean;
    rewardStyle?: ViewStyle;
    style?: ViewStyle;
}

export default observer(
    ({
        store,
        initialIndex = 0,
        getVisibleItem,
        fetchData,
        showBottomInput,
        EmptyComponent,
        rewardEnable,
        listRef,
        rewardStyle,
        style,
        ...flatListProps
    }: Props) => {
        const navigation = useNavigation();
        const commentRef = useRef();

        const onLayout = useCallback((event) => {
            const { height } = event.nativeEvent.layout;
            store.fullVideoHeight = height;
        }, []);

        const onMomentumScrollEnd = useCallback(
            __.debounce(() => {
                if (fetchData instanceof Function) {
                    fetchData();
                }
            }),
            [fetchData],
        );

        const getVisibleRows = useCallback(
            (info) => {
                if (info.viewableItems[0]) {
                    getVisibleItem(info.viewableItems[0].index);
                }
            },
            [getVisibleItem],
        );

        const listFooter = useCallback(() => {
            if (store.data.length > 0 && store.status !== 'loadAll') {
                return (
                    <View style={styles.listFooter}>
                        <LottieView
                            source={require('@app/assets/json/loading.json')}
                            style={{ width: '30%' }}
                            loop
                            autoPlay
                        />
                    </View>
                );
            }
            return null;
        }, [store.data, store.status]);

        const listEmpty = useCallback(() => {
            if (store.status == 'loading') {
                return (
                    <ImageBackground style={styles.emptyContainer} source={require('@app/assets/images/curtain.png')}>
                        <LottieView
                            source={require('@app/assets/json/loading.json')}
                            style={{ width: '50%' }}
                            loop
                            autoPlay
                        />
                    </ImageBackground>
                );
            } else if (React.isValidElement(EmptyComponent)) {
                return EmptyComponent;
                // return null;
            } else {
                return <Image style={styles.emptyContainer} source={require('@app/assets/images/curtain.png')} />;
            }
        }, [store.status]);

        // TODO:领取广告奖励接口
        // const [onClickReward] = useMutation(GQL.RewardMutation, {
        //     variables: {
        //         reason: 'DRAW_FEED_ADVIDEO_REWARD',
        //     },
        //     refetchQueries: () => [
        //         {
        //             query: GQL.MeMetaQuery,
        //         },
        //     ],
        // });

        // TODO:点击领取奖励
        const getReward = useCallback(async () => {
            // const drawFeedAdId = media.id.toString();
            // if (videoStore.rewardedVideos.indexOf(drawFeedAdId) === -1) {
            //     videoStore.addRewardedId(drawFeedAdId);
            //     // 发放给精力奖励
            //     const [error, res] = await Helper.exceptionCapture(onClickReward);
            //     if (error) {
            //         Toast.show({
            //             content: '遇到未知错误，领取失败',
            //         });
            //     } else {
            //         const gold = Helper.syncGetter('data.reward.gold', res);
            //         RewardOverlay.show({
            //             reward: {
            //                 gold: gold,
            //             },
            //             title: '领取点击详情奖励成功',
            //         });
            //         rewardTrack({
            //             name: `点击drawFeed广告奖励`,
            //         });
            //     }
            // } else {
            //     Toast.show({
            //         content: `该视频已获取过点击奖励`,
            //         duration: 2000,
            //     });
            // }
        }, []);

        const renderVideoItem = useCallback(
            ({ item, index }) => {
                // 显示drawFeed广告
                if (item?.is_ad && adStore.enableAd) {
                    return (
                        <View style={{ height: store.fullVideoHeight }}>
                            <ad.DrawFeed codeid={adStore.codeid_draw_video} onAdClick={getReward} />
                            {/* TODO: 引导用户点击*/}
                            {/* <View style={styles.adClickTip}>
                            <Image
                                source={require('@app/assets/images/click_tips.png')}
                                style={styles.adClickTipImage}
                            />
                            <Text style={styles.adClickTipText}>戳一戳，领取奖励</Text>
                        </View> */}
                        </View>
                    );
                }
                return <VideoItem store={store} media={item} index={index} />;
            },
            [adStore.enableAd],
        );

        // 模态框事件处理
        useEffect(() => {
            const hardwareBackPress = BackHandler.addEventListener('hardwareBackPress', () => {
                if (commentRef.current?.state?.visible) {
                    commentRef.current?.slideDown();
                    return true;
                }
                return false;
            });
            DeviceEventEmitter.addListener('showCommentModal', () => {
                commentRef.current?.slideUp();
            });
            DeviceEventEmitter.addListener('hideCommentModal', () => {
                commentRef.current?.slideDown();
            });

            return () => {
                hardwareBackPress.remove();
                DeviceEventEmitter.removeListener('showCommentModal');
                DeviceEventEmitter.removeListener('hideCommentModal');
            };
        }, []);

        // 视频奖励进度
        useAdReward(store, rewardEnable);

        return (
            <View style={[styles.container, style]}>
                <View style={styles.listContainer}>
                    <FlatList
                        ref={listRef}
                        onLayout={onLayout}
                        contentContainerStyle={styles.contentContainerStyle}
                        data={store.data}
                        initialScrollIndex={initialIndex}
                        initialNumToRender={1}
                        bounces={false}
                        scrollsToTop={false}
                        pagingEnabled={true}
                        removeClippedSubviews={true}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        keyExtractor={(item, index) => String(item?.id || index)}
                        renderItem={renderVideoItem}
                        getItemLayout={(data, index) => ({
                            length: store.fullVideoHeight,
                            offset: store.fullVideoHeight * index,
                            index,
                        })}
                        ListEmptyComponent={listEmpty}
                        ListFooterComponent={listFooter}
                        onMomentumScrollEnd={onMomentumScrollEnd}
                        onViewableItemsChanged={getVisibleRows}
                        viewabilityConfig={config}
                        {...flatListProps}
                    />
                </View>
                {/* 金币奖励悬浮球 */}
                {rewardEnable && adStore.enableWallet && (
                    <View style={[styles.rewardProgress, rewardStyle]}>
                        <RewardProgress store={store} />
                    </View>
                )}
                {/* 内部视频列表显示评论框 */}
                {showBottomInput && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.commentInput}
                        onPress={() => {
                            commentRef.current?.slideUp({ autoFocus: true });
                        }}>
                        <CommentInput editable={false} />
                    </TouchableOpacity>
                )}
                {/* 评论模态框 */}
                <CommentOverlay ref={commentRef} media={store.currentItem} navigation={navigation} />
            </View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingBottom: Device.isFullScreenDevice ? Theme.BOTTOM_HEIGHT : 0,
    },
    listContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    contentContainerStyle: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        width: undefined,
        height: undefined,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listFooter: {
        alignItems: 'center',
    },
    commentInput: {
        position: 'absolute',
        bottom: Theme.HOME_INDICATOR_HEIGHT,
        zIndex: 1,
        height: 50,
        width: '100%',
    },
    inputStyle: {
        color: '#fff',
    },
    rewardProgress: {
        position: 'absolute',
        right: pixel(10),
        top: Theme.statusBarHeight + Theme.NAVBAR_HEIGHT + pixel(70),
        // bottom: pixel(360 + Theme.HOME_INDICATOR_HEIGHT),
    },
    contentCover: {
        ...StyleSheet.absoluteFillObject,
    },
    mediaCurtain: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: undefined,
        height: undefined,
    },
    blackMask: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    adClickTip: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: pixel(15),
        bottom: pixel(25),
    },
    adClickTipImage: {
        width: pixel((20 * 208) / 118),
        height: pixel(20),
    },
    adClickTipText: {
        color: '#C0CBD4',
        fontSize: font(12),
        marginHorizontal: pixel(10),
    },
});

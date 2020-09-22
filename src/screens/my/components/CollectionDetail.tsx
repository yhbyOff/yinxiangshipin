import React, { useContext, useState, useCallback, useEffect, useMemo, useRef, Fragment } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import { observer, appStore } from '@src/store';
import { NavBarHeader, SafeText, Iconfont, Row } from '@src/components';
import { syncGetter, count, mergeProperty } from '@src/common';
import { GQL, useQuery } from '@src/apollo';
import { ContentStatus } from '@src/content';
import { observable } from 'mobx';
import { useRoute, useNavigation } from '@react-navigation/native';

export default observer((props: any) => {
    const navigation = useNavigation();
    const route = useRoute();
    const tag = route?.params?.tag;
    const [hot, setHot] = useState(false);
    const user_name = route?.params?.user_name;
    const [isCollect, setIsCollect] = useState(false);

    const scrollAnimateValue = useRef(new Animated.Value(0));

    const onScroll = useMemo(() => {
        return Animated.event([{ nativeEvent: { contentOffset: { y: scrollAnimateValue.current } } }], {
            useNativeDriver: false,
        });
    }, []);

    const titleOpacity = scrollAnimateValue.current.interpolate({
        inputRange: [pixel(50), percent(50)],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const { loading, error, data, fetchMore, refetch } = useQuery(GQL.tagPostsQuery, {
        variables: {
            tag_id: tag?.id,
            count: 12,
            order: hot ? 'HOT' : 'LATEST',
            visibility: 'all',
        },
        fetchPolicy: 'network-only',
    });
    const tagData = useMemo(() => data?.tag || tag, [data]);
    const listData = useMemo(() => data?.tag?.posts?.data, [data]);
    const nextPage = useMemo(() => data?.tag?.posts?.paginatorInfo?.currentPage + 1 || 2, [data]);
    const hasMore = useMemo(() => data?.tag?.posts?.paginatorInfo?.hasMorePages, [data]);
    const isLoading = useRef(false);
    const onEndReached = useCallback(() => {
        if (!isLoading.current && hasMore) {
            isLoading.current = true;
            fetchMore({
                variables: {
                    page: nextPage,
                },
                updateQuery: (prev: any, { fetchMoreResult }) => {
                    isLoading.current = false;
                    if (!fetchMoreResult) return prev;
                    return mergeProperty(prev, fetchMoreResult);
                },
            });
        }
    }, [nextPage, hasMore, fetchMore]);

    const goToScreen = useCallback(({ item, tag, initData, itemIndex, page }) => {
        if (item?.video?.id) {
            navigation.push('TagVideoList', { tag, initData, itemIndex, page });
        } else {
            navigation.push('PostDetail', { post: item });
        }
    }, []);

    const renderItem = useCallback(
        ({ item, index }) => {
            let cover;
            if (item?.video?.id) {
                cover = item?.video?.dynamic_cover || item?.video?.cover;
            } else {
                cover = item?.images?.['0']?.url;
            }
            return (
                <TouchableWithoutFeedback
                    onPress={() =>
                        goToScreen({
                            item,
                            tag,
                            initData: listData,
                            itemIndex: index,
                            page: nextPage,
                        })
                    }>
                    <View style={styles.itemWrap}>
                        <Image style={styles.videoCover} source={{ uri: cover }} />
                        <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'space-around' }}>
                            <SafeText style={styles.contentText} numberOfLines={2}>
                                {item.content || item.description}
                            </SafeText>
                            <Row>
                                <Iconfont
                                    name={isCollect ? 'xihuanfill' : 'xihuan'}
                                    size={font(15)}
                                    color={isCollect ? Theme.primaryColor : '#fff'}
                                />
                                <Text style={[styles.contentText, { marginLeft: pixel(3) }]} numberOfLines={1}>
                                    {item.count_likes}
                                </Text>
                            </Row>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            );
        },
        [tag, listData, nextPage],
    );

    const listHeader = useMemo(() => {
        return (
            <>
                <View style={styles.header}>
                    <View style={styles.tagLogoWrap}>
                        <Image style={styles.tagLogo} source={require('@app/assets/images/icons/ic_tag_red.png')} />
                    </View>
                    <View style={styles.tagInfo}>
                        <Text style={styles.tagName}>#{tagData?.name}</Text>
                        <Text style={styles.tagCount}>{`${count(
                            tagData?.count_plays || 0.0,
                        )}次播放 · @${user_name}`}</Text>
                        <View style={styles.tagInfoBottom}>
                            <Text style={styles.tagCount}>
                                {`更新至第${tagData?.count_posts > 0 ? count(tagData?.count_posts) : '0'}集`}
                            </Text>
                            <TouchableOpacity
                                style={styles.filterBtn}
                                onPress={() =>
                                    setHot((h) => {
                                        return !h;
                                    })
                                }
                                activeOpacity={1}>
                                <Image
                                    style={styles.filterIcon}
                                    source={require('@app/assets/images/icons/ic_order_gray.png')}
                                />
                                <Text style={styles.filterBtnName}>{hot ? '最多点赞' : '最新发布'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.collectBtn}
                    onPress={() =>
                        setIsCollect((r) => {
                            return !r;
                        })
                    }>
                    <Iconfont
                        name={isCollect ? 'xihuanfill' : 'xihuan'}
                        size={font(15)}
                        color={isCollect ? Theme.primaryColor : '#fff'}
                    />
                    <Text style={[styles.contentText, { marginLeft: pixel(3) }]}>
                        {isCollect ? '已收藏' : '收藏合集'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.lineStyle} />
            </>
        );
    }, [hot, tagData, isCollect]);

    const listFooter = useCallback(() => {
        let footer = null;
        if (!loading && hasMore) {
            footer = <ContentStatus status="loadMore" />;
        }
        if (listData?.length > 0 && !hasMore) {
            footer = (
                <View style={styles.listFooter}>
                    <Text style={styles.listFooterText}>-- end --</Text>
                </View>
            );
        }
        return footer;
    }, [loading, listData, hasMore]);

    const listEmpty = useCallback(() => {
        let status = '';
        switch (true) {
            case error:
                status = 'error';
                break;
            case loading:
                status = 'loading';
                break;
            case listData?.length === 0:
                status = 'empty';
                break;
            default:
                break;
        }
        if (status) {
            return <ContentStatus status={status} refetch={status === 'error' ? refetch : undefined} />;
        } else {
            return null;
        }
    }, [loading, listData, error, refetch]);

    return (
        <View style={styles.container}>
            <NavBarHeader
                isTransparent
                hasSearchButton={true}
                onPressSearch={() => navigation.push('SearchVideo', { tag_id: tag.id })}
                centerStyle={{ opacity: titleOpacity }}
                title={tag?.name}
            />
            <FlatList
                data={listData}
                onScroll={onScroll}
                contentContainerStyle={styles.contentContainer}
                renderItem={renderItem}
                keyExtractor={(item, index) => String(item.id || index)}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                ListEmptyComponent={listEmpty}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.1}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161924',
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: Theme.HOME_INDICATOR_HEIGHT,
    },
    navTitle: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: pixel(40),
    },
    title: {
        fontSize: font(18),
        color: '#fff',
    },
    header: {
        flexDirection: 'row',
        padding: pixel(15),
        paddingTop: pixel(5),
        paddingBottom: pixel(20),
    },
    tagLogoWrap: {
        width: percent(25),
        height: percent(25),
        borderRadius: pixel(2),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    tagLogo: {
        width: '50%',
        height: '50%',
    },
    tagInfo: {
        flex: 1,
        marginLeft: pixel(15),
        justifyContent: 'space-around',
    },
    tagInfoBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tagName: {
        marginBottom: pixel(5),
        fontSize: font(18),
        fontWeight: 'bold',
        color: '#fff',
    },
    tagCount: {
        fontSize: font(14),
        color: '#b2b2b2',
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterIcon: {
        width: pixel(15),
        height: pixel(15),
        marginRight: pixel(2),
    },
    filterBtnName: {
        fontSize: font(14),
        color: '#b2b2b2',
    },
    collectBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#666',
        borderRadius: pixel(2),
        marginHorizontal: pixel(Theme.itemSpace),
        paddingVertical: pixel(10),
        marginBottom: pixel(20),
    },
    itemWrap: {
        width: Device.WIDTH,
        flexDirection: 'row',
        paddingHorizontal: pixel(Theme.itemSpace),
        marginVertical: pixel(Theme.itemSpace) / 2,
    },
    videoCover: {
        width: percent(18),
        height: percent(18) * 1.4,
        marginRight: pixel(10),
        borderRadius: pixel(2),
    },
    contentText: {
        fontSize: font(14),
        color: '#fff',
    },
    lineStyle: {
        height: pixel(0.5),
        backgroundColor: '#666',
        marginBottom: pixel(Theme.itemSpace) / 2,
    },
    columnWrapperStyle: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#161924',
    },
    listFooter: {
        paddingVertical: pixel(15),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listFooterText: {
        fontSize: font(13),
        color: '#b4b4b4',
    },
});
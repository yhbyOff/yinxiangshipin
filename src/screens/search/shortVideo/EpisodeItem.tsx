import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Image, TouchableOpacity } from 'react-native';
import { SafeText, Iconfont, Row } from '@src/components';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react';
interface Props {
    item?: any;
    index?: number;
    listData?: any[];
    nextPage?: number;
    collection: any;
    addPostPress: any;
    videoData: any;
}
const EpisodeItem = observer((props: Props) => {
    let { item, index, listData, nextPage, count, collection, addPostPress, videoData } = props;
    const navigation = useNavigation();
    // 创建合集 -> 选择作品页 -> isAddCollection判断能否添加当前作品
    // isStash：添加作品时判断是否已在添加区，true则不可点击添加按钮
    const isStash = videoData ? !!videoData.find((video) => video.post_id === item.id) : false;
    // isAddCollection：是否已存在某个合集中 或 是否已在缓存区，true则不可点击添加按钮
    const isAddCollection = item?.collections.length > 0 || isStash;

    let cover;
    if (item?.video?.id) {
        cover = item?.video?.cover;
    } else {
        cover = item?.images?.['0']?.url;
    }

    const goToScreen = useCallback(() => {
        if (item?.video?.id) {
            navigation.push('CollectionVideoList', {
                collection,
                initData: listData,
                itemIndex: index,
                page: nextPage,
                count,
            });
        } else {
            navigation.push('PostDetail', { post: item });
        }
    }, [props]);

    return (
        <TouchableWithoutFeedback onPress={goToScreen} disabled={!collection}>
            <View style={styles.itemWrap}>
                <Image style={styles.videoCover} source={{ uri: cover }} />
                <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'space-around' }}>
                    <SafeText style={styles.contentText} numberOfLines={2}>
                        {item?.current_episode && `第${item?.current_episode}集￨`}
                        {`${item?.content || item?.description}`}
                    </SafeText>
                    <Row>
                        <SafeText style={[styles.metaText, { marginRight: pixel(15) }]}>
                            {Helper.moment(item?.video?.duration)}
                        </SafeText>
                        <Iconfont
                            name={item.liked ? 'xihuanfill' : 'xihuan'}
                            size={pixel(15)}
                            color={item.liked ? Theme.primaryColor : '#909090'}
                        />
                        <SafeText style={[styles.metaText, { marginLeft: pixel(3) }]} numberOfLines={1}>
                            {item.count_likes}
                        </SafeText>
                    </Row>
                </View>
                {addPostPress && (
                    <TouchableOpacity
                        style={[styles.selectedBox, isAddCollection && { borderColor: '#666' }]}
                        onPress={() => addPostPress(item)}
                        disabled={isAddCollection}>
                        <Iconfont name="iconfontadd" size={pixel(18)} color={isAddCollection ? '#666' : '#202020'} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
});

const styles = StyleSheet.create({
    itemWrap: {
        width: Device.width,
        flexDirection: 'row',
        paddingHorizontal: pixel(Theme.edgeDistance),
        marginVertical: pixel(Theme.edgeDistance) / 2,
    },
    videoCover: {
        width: percent(18),
        height: percent(18) * 1.4,
        marginRight: pixel(10),
        borderRadius: pixel(2),
    },
    contentText: {
        fontSize: font(15),
        color: '#202020',
    },
    metaText: {
        fontSize: font(13),
        color: '#909090',
    },
    selectedBox: {
        padding: pixel(2),
        alignSelf: 'center',
        borderRadius: percent(50),
        borderColor: '#202020',
        borderWidth: pixel(1),
        marginLeft: pixel(10),
    },
});

export default EpisodeItem;

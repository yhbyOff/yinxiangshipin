import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { observer, autorun, adStore, userStore } from '@src/store';
import { PlayerStore } from '@src/components/MoviePlayer';
import { DebouncedPressable, Iconfont } from '@src/components';
import movieStore from '../store';
import AnthologyButton from './AnthologyButton';

export default observer(() => {
    const [visible, setVisible] = useState(false);
    const [movie, setMovie] = useState({});
    const [showEpisodes, setShow] = useState(false);

    const showModal = useCallback((data) => {
        setMovie(data);
        setVisible(true);
        setShow(data?.selectEpisode || false);
    }, []);

    const hideModal = useCallback(() => {
        setVisible(false);
        movieStore.reduceRewardNotice();
    }, []);

    useEffect(
        () =>
            autorun(() => {
                if (movieStore.movieData.length > 0) {
                    showModal(movieStore.movieData[0]);
                }
            }),
        [],
    );

    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={hideModal}
            animated={true}
            transparent={true}
            statusBarTranslucent={true}
            hardwareAccelerated={true}>
            <View style={styles.modalView}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { marginBottom: 0 }]}>{showEpisodes ? '选集' : '简介'}</Text>
                        <DebouncedPressable style={styles.closeBtn} onPress={hideModal} activeOpacity={1}>
                            <Iconfont name="guanbi1" size={font(15)} color={'#333'} />
                        </DebouncedPressable>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* showEpisodes：展示选集（true）或是简介（false） */}
                        {showEpisodes ? (
                            <View style={styles.episodesContentStyle}>
                                {(movie?.data || []).map((item, index) => {
                                    return (
                                        <AnthologyButton
                                            key={(item, index) => String(item.name + index)}
                                            style={{ marginBottom: pixel(12) }}
                                            active={PlayerStore.currentEpisodeIndex === index}
                                            content={index + 1}
                                            onPress={() => {
                                                PlayerStore.setCurrentEpisode(item, index);
                                                setVisible(false);
                                            }}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={{ padding: pixel(Theme.itemSpace) }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <Image source={{ uri: movie?.cover }} style={styles.cover} />
                                    </View>
                                    <View style={styles.right}>
                                        <Text style={styles.title}>{movie.name}</Text>
                                        <Text style={styles.info}>
                                            {movie.region && `${movie.region} · `}
                                            {movie.year && `${movie.year} · `}
                                            {movie.style && `${movie.style} · `}
                                            {movie.count_series && `更新至第${movie.count_series}集`}
                                        </Text>
                                        {!!movie.producer && <Text style={styles.info}>导演：{movie.producer}</Text>}
                                        {!!movie.actors && <Text style={styles.info}>演员：{movie.actors}</Text>}
                                    </View>
                                </View>
                                {!!movie.introduction && (
                                    <View>
                                        <Text style={[styles.title, { marginTop: pixel(20) }]}>概要</Text>
                                        <Text style={[styles.info, { color: '#666666' }]}>{movie.introduction}</Text>
                                    </View>
                                )}
                                {movie.count_favorites > 0 && (
                                    <Text style={styles.info}>{movie.count_favorites}人收藏</Text>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: Device.WIDTH,
        height: Device.HEIGHT - Device.WIDTH * 0.6,
        backgroundColor: '#fff',
    },
    header: {
        height: pixel(42),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: pixel(Theme.itemSpace),
        borderBottomColor: '#EEEEEE',
        borderBottomWidth: pixel(1),
    },
    title: {
        fontSize: font(16),
        fontWeight: 'bold',
        marginBottom: pixel(10),
    },
    closeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: pixel(22),
        height: pixel(22),
        borderRadius: pixel(10),
        borderWidth: pixel(1),
        borderColor: '#f0f0f0',
    },
    cover: {
        width: Device.WIDTH * 0.35,
        height: Device.WIDTH * 0.45,
        borderRadius: pixel(5),
        resizeMode: 'cover',
    },
    right: {
        flex: 1,
        height: Device.WIDTH * 0.45,
        paddingHorizontal: pixel(10),
        overflow: 'hidden',
    },
    info: {
        fontSize: font(12),
        lineHeight: pixel(20),
        color: '#333',
        marginBottom: pixel(5),
    },
    episodesContentStyle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: pixel(18),
        paddingRight: pixel(2),
    },
});

import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { GQL } from '@src/apollo';
import TaskItem from './TaskItem';

// const tasksType = [
//     {
//         type: '每日任务',
//         gql: GQL.dailyTasksQuery,
//     },
//     {
//         type: '新人任务',
//         gql: GQL.userTasksQuery,
//     },
//     {
//         type: '奖励任务',
//         gql: GQL.customTasksQuery,
//     },
// ];

// const promises = React.useCallback(() => {
//     return tasksType.map(function(task) {
//         return client.query({ query: task.gql, variables: { fetchPolicy: 'network-only' } });
//     });
// }, [client]);

// const processPromises = React.useCallback(() => {
//     Promise.all(promises())
//         .then(function(posts) {
//             setSectionData(() => {
//                 return posts.map((post, index) => {
//                     return {
//                         title: tasksType[index].type,
//                         data: Helper.syncGetter('data.tasks', post),
//                     };
//                 });
//             });
//         })
//         .catch(function(reason) {
//             Toast.show({ content: reason || '无法获取任务，请稍后再试' });
//         });
// }, [promises]);

export default function TaskList() {
    const navigation = useNavigation();

    const { data, refetch, error } = useQuery(GQL.tasksQuery, {
        fetchPolicy: 'network-only',
    });

    const tasksMap = useMemo(() => {
        const tasksData = data?.tasks;
        if (Array.isArray(tasksData) && tasksData.length > 0) {
            const dailyTasks = { title: '每日任务', data: [] };
            const newUserTasks = { title: '新人任务', data: [] };
            for (const task of tasksData) {
                if (task.group === '新人任务') {
                    newUserTasks.data.push(task);
                }
                if (task.group === '每日任务') {
                    dailyTasks.data.push(task);
                }
            }
            return [newUserTasks, dailyTasks];
        }
    }, [data]);

    useEffect(() => {
        const navFocusListener = navigation.addListener('focus', () => {
            if (refetch instanceof Function) {
                refetch();
            }
        });
        return () => {
            navFocusListener();
        };
    }, []);

    return (
        <SectionList
            sections={tasksMap}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <TaskItem task={item} />}
            ListEmptyComponent={() => <View />}
            renderSectionHeader={({ section: { title, data } }) =>
                data.length > 0 ? <Text style={styles.listHeader}>{title}</Text> : null
            }
            ItemSeparatorComponent={() => <View style={styles.taskItemSeparator} />}
        />
    );
}

const styles = StyleSheet.create({
    listHeader: {
        color: '#202020',
        marginTop: pixel(20),
        marginBottom: pixel(10),
        marginHorizontal: pixel(15),
        fontSize: font(17),
        fontWeight: 'bold',
    },
    taskItemSeparator: {
        height: pixel(12),
        backgroundColor: '#F5F6FB',
    },
});

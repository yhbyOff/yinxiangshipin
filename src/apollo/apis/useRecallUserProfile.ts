import React, { useEffect } from 'react';
import { RecordKeys, Storage, userStore } from '@src/store';
import { useQuery } from '@apollo/react-hooks';
import { GQL } from '../gqls';

export function useRecallUserProfile({ login }: { login: boolean }) {
    const { data } = useQuery(GQL.MeMetaQuery, {
        fetchPolicy: 'network-only',
        skip: !login,
    });

    useEffect(() => {
        if (data?.me) {
            userStore.changeProfile(data?.me);
        }
    }, [data]);

    useEffect(() => {
        (async function getMeFormStorage() {
            const profile = await Storage.getItem(RecordKeys.me);
            userStore.recallUser(profile);
        })();
    }, []);
}

import React, { useCallback, useEffect, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { userStore } from '@src/store';
import { GQL } from '../graphgqls';

export function usePreloadData(isLogin: boolean) {
    useQuery(GQL.searchHotKeywordsQuery, {
        variables: { type: 'SEARCH' },
    });
    const [loadWithdrawAmountList, { called }] = useLazyQuery(GQL.getWithdrawAmountList, {
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (isLogin) {
            if (!called) {
                loadWithdrawAmountList();
            }
        }
    }, [isLogin, called]);
}

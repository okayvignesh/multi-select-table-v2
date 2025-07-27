import { useCallback } from 'react';
import axios from 'axios';

export const useApiWithStatus = ({ setApiStatus }) => {
    const fetchData = useCallback(async ({
        apiKey,
        url,
        method = 'GET',
        data = null,
        timeout = 8000,
        onSuccess
    }) => {
        setApiStatus(prev => ({
            ...prev,
            [apiKey]: { status: 'loading', message: '' }
        }));

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await axios({
                method,
                url,
                data,
                signal: controller.signal
            });

            const result = response?.data?.result;

            const isEmptyArray = Array.isArray(result) && result.length === 0;
            const isEmptyObject = result && typeof result === 'object' && Object.keys(result).length === 0;

            if (!result || isEmptyArray || isEmptyObject) {
                setApiStatus(prev => ({
                    ...prev,
                    [apiKey]: { status: 'empty', message: 'No data found' }
                }));
                return;
            }

            onSuccess?.(result);

            setApiStatus(prev => ({
                ...prev,
                [apiKey]: { status: 'success', message: '' }
            }));
        } catch (error) {
            const isTimeout = error.code === 'ERR_CANCELED';
            const message = isTimeout ? 'Request timed out' : 'Error fetching data';

            setApiStatus(prev => ({
                ...prev,
                [apiKey]: { status: 'error', message }
            }));

        } finally {
            clearTimeout(timer);
        }
    }, [setApiStatus]);

    return { fetchData };
};

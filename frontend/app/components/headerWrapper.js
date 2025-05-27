'use client';

import Header from './header';
import useNotificationCustom from '../hooks/useNotificationCustom';

export default function HeaderWrapper() {
    const { contextHolder } = useNotificationCustom();
    
    return (
        <>
            {contextHolder}
            <Header />
        </>
    );
}

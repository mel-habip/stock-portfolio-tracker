import React from 'react';
import { Textarea } from '@nextui-org/react';

export default function ErrorModule({ errorMessage }) {


    if (!errorMessage) return;

    console.log('errorModule:', errorMessage);

    return (
        <>
            <Textarea
                aria-label="error"
                readOnly
                rows={2}
                status="error"
                value={errorMessage}
            />
        </>
    );
}

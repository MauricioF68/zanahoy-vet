import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

export default function GlobalToast() {
    const { flash = {} } = usePage().props;

    useEffect(() => {
        // Quitamos el console.log porque ya comprobamos que funciona :)

        if (flash.message) {
            toast.success(flash.message, {
                // 👇 Eliminamos la línea del "id" para que siempre aparezca
                duration: 4000,
                style: {
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    color: '#334155',
                },
            });
        }

        if (flash.error) {
            toast.error(flash.error, {
                // 👇 Eliminamos la línea del "id" aquí también
                duration: 5000,
                style: {
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    color: '#991b1b',
                },
            });
        }
    }, [flash]); // 👈 Volvemos a escuchar el objeto completo

    return (
        <div style={{ zIndex: 99999, position: 'relative' }}>
            <Toaster position="top-right" reverseOrder={false} />
        </div>
    );
}
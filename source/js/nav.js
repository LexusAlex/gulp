// экспортируем сущности модуля чтобы они были доступны из других модулей
// просто изкпортиркем сущности

function t() {
    console.log('t');
}

function g() {
    console.log('g');
}

export {t, g};
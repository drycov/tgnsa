const tg = window.Telegram.WebApp;

export function useTelegram() {

    const onClose = () => {
        tg.close()
    }

    const toggleButtonVisibility = (button) => {
        if (button.isVisible) {
            button.hide();
        } else {
            button.show();
        }
    };
    
    const onToggleButton = () => tg.MainButton && toggleButtonVisibility(tg.MainButton);
    const onToggleSettingsButton = () => tg.SettingsButton && toggleButtonVisibility(tg.SettingsButton);
    const onToggleBackButton = () => tg.BackButton && toggleButtonVisibility(tg.BackButton);
    
    

    return {
        onClose,
        onToggleButton,
        onToggleSettingsButton,
        onToggleBackButton,

        tg,
        user: tg.initDataUnsafe?.user,
        queryId: tg.initDataUnsafe?.query_id,
    }
}
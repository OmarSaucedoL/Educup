import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/Escudo_FICCT_monocromo.jpg" 
            alt="Logo FICCT" 
            style={{ objectFit: 'contain', ...props.style }}
        />
    );
}

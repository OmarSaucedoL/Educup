import { CupForm, type Usuario, type CatalogCarrera, type CatalogMateria, type Cup } from './components/cup-form';

interface EditarCUPProps {
    cup: Cup;
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

export default function EditarCUP({ cup, usuarios = [], carreras = [], materias = [] }: EditarCUPProps) {
    return (
        <CupForm 
            mode="edit"
            cup={cup}
            usuarios={usuarios} 
            carreras={carreras} 
            materias={materias} 
        />
    );
}

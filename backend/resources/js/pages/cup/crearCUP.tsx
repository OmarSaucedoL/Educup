import { CupForm, type Usuario, type CatalogCarrera, type CatalogMateria } from './components/cup-form';

interface CrearCUPProps {
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

export default function CrearCUP({ usuarios = [], carreras = [], materias = [] }: CrearCUPProps) {
    return (
        <CupForm 
            mode="create" 
            usuarios={usuarios} 
            carreras={carreras} 
            materias={materias} 
        />
    );
}

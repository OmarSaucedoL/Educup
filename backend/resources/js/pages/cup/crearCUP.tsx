import { CupForm, type Usuario, type CatalogCarrera, type CatalogMateria } from './components/cup-form';

interface CrearCUPProps {
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

const EMPTY_USUARIOS: Usuario[] = [];
const EMPTY_CARRERAS: CatalogCarrera[] = [];
const EMPTY_MATERIAS: CatalogMateria[] = [];

export default function CrearCUP({ usuarios = EMPTY_USUARIOS, carreras = EMPTY_CARRERAS, materias = EMPTY_MATERIAS }: CrearCUPProps) {
    return (
        <CupForm 
            mode="create" 
            usuarios={usuarios} 
            carreras={carreras} 
            materias={materias} 
        />
    );
}

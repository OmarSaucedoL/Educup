import { CupForm, type Usuario, type CatalogCarrera, type CatalogMateria, type Cup } from './components/cup-form';

interface EditarCUPProps {
    cup: Cup;
    usuarios: Usuario[];
    carreras: CatalogCarrera[];
    materias: CatalogMateria[];
}

const EMPTY_USUARIOS: Usuario[] = [];
const EMPTY_CARRERAS: CatalogCarrera[] = [];
const EMPTY_MATERIAS: CatalogMateria[] = [];

export default function EditarCUP({ cup, usuarios = EMPTY_USUARIOS, carreras = EMPTY_CARRERAS, materias = EMPTY_MATERIAS }: EditarCUPProps) {
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

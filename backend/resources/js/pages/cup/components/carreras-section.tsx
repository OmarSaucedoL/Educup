import { CheckSquare, Square } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';

export interface CatalogCarrera {
    ID_CARRERA: number;
    NOMBRE: string;
}

interface CarrerasSectionProps {
    carreras: CatalogCarrera[];
    selectedCarreras: { ID_CARRERA: number; CUPOS: number }[];
    handleCareerToggle: (carreraId: number) => void;
    handleCareerQuotaChange: (carreraId: number, quota: number) => void;
    processing: boolean;
    isLocked: boolean;
    error?: string;
}

export function CarrerasSection({
    carreras,
    selectedCarreras,
    handleCareerToggle,
    handleCareerQuotaChange,
    processing,
    isLocked,
    error,
}: CarrerasSectionProps) {
    return (
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Carreras Ofertadas en el Periodo
            </span>
            <p className="text-xs text-muted-foreground mb-4">
                Selecciona qué carreras participarán en este CUP y define su cupo/vacante de estudiantes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {carreras.map(c => {
                    const isSelected = !!selectedCarreras.find(sc => sc.ID_CARRERA === c.ID_CARRERA);
                    const scValue = selectedCarreras.find(sc => sc.ID_CARRERA === c.ID_CARRERA);
                    
                    return (
                        <div 
                            key={c.ID_CARRERA} 
                            className={`flex flex-col p-4 rounded-xl border transition-all ${
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={() => handleCareerToggle(c.ID_CARRERA)}
                                    className="flex items-center gap-2.5 text-left focus:outline-none"
                                    disabled={processing || isLocked}
                                >
                                    {isSelected ? (
                                        <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                                    ) : (
                                        <Square className="h-5 w-5 text-neutral-400 dark:text-neutral-600 shrink-0" />
                                    )}
                                    <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                                        {c.NOMBRE}
                                    </span>
                                </button>
                            </div>

                            {isSelected && (
                                <div className="mt-2 pl-7 flex items-center gap-3 animate-in fade-in duration-200">
                                    <Label htmlFor={`quota-${c.ID_CARRERA}`} className="text-xs font-semibold text-neutral-500 shrink-0">
                                        Cupo Específico:
                                    </Label>
                                    <Input
                                        id={`quota-${c.ID_CARRERA}`}
                                        type="number"
                                        min="1"
                                        required
                                        value={scValue?.CUPOS || ''}
                                        onChange={e => handleCareerQuotaChange(c.ID_CARRERA, parseInt(e.target.value) || 0)}
                                        className="h-8 max-w-[120px] font-bold text-xs"
                                        disabled={processing || isLocked}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <InputError message={error} />
        </div>
    );
}

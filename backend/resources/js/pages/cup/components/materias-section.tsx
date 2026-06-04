import { CheckSquare, Square, Info, BookOpen } from 'lucide-react';
import InputError from '@/components/input-error';

export interface CatalogMateria {
    ID_MATERIA: number;
    NOMBRE: string;
}

interface MateriasSectionProps {
    materias: CatalogMateria[];
    selectedMateriaIds: number[];
    handleMateriaToggle: (materiaId: number) => void;
    processing: boolean;
    isLocked: boolean;
    error?: string;
}

export function MateriasSection({
    materias,
    selectedMateriaIds,
    handleMateriaToggle,
    processing,
    isLocked,
    error,
}: MateriasSectionProps) {
    return (
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <div className="flex items-center justify-between mb-2">
                <span className="block text-xs font-bold text-primary uppercase tracking-wider">
                    Materias Asignadas al CUP (Máx. 4)
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedMateriaIds.length === 4
                        ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                        : 'bg-primary/10 text-primary border border-primary/20'
                }`}>
                    Seleccionadas: {selectedMateriaIds.length} / 4
                </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                Selecciona un máximo de 4 materias académicas que formarán parte de la malla de evaluaciones de este periodo pre-facultativo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {materias.map(m => {
                    const isSelected = selectedMateriaIds.includes(m.ID_MATERIA);
                    const isLimitReached = selectedMateriaIds.length >= 4;
                    const isDisabled = isLimitReached && !isSelected;

                    return (
                        <button
                            key={m.ID_MATERIA}
                            type="button"
                            disabled={isDisabled || processing || isLocked}
                            onClick={() => handleMateriaToggle(m.ID_MATERIA)}
                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-xs'
                                    : isDisabled
                                    ? 'opacity-40 cursor-not-allowed border-neutral-200 dark:border-neutral-800'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                            }`}
                        >
                            <div className="shrink-0">
                                {isSelected ? (
                                    <CheckSquare className="h-5 w-5 text-primary" />
                                ) : (
                                    <Square className="h-5 w-5 text-neutral-400 dark:text-neutral-600" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                    <BookOpen className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                                    {m.NOMBRE}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <InputError message={error} />
        </div>
    );
}

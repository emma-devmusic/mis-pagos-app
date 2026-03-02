import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export type PageAction = {
    label: string
    variant?: 'primary' | 'secondary' | 'ghost'
    onClick: () => void
}

type PageProps = {
    eyebrow?: string
    title: string
    description: string
    onBack?: () => void
    actions?: PageAction[]
    children: ReactNode
}

function Page({ eyebrow, title, description, onBack, actions, children }: PageProps) {
    return (
        <div className="page w-full">
            <header className="page-header">
                <div className="flex flex-col gap-3 md:flex-row justify-between">
                    <div className='flex gap-3 items-center'>
                        {onBack ? (
                            <button type="button" className="ghost p-2!" onClick={onBack}>
                                <ArrowLeft size={20} />
                            </button>
                        ) : null}
                        <div>
                        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
                            <h1 className="page-title mb-1!">{title}</h1>
                            <p className="muted">{description}</p>
                        </div>
                    </div>
                    {actions && actions.length > 0 ? (
                        <div className="w-full md:w-fit">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`${action.variant || 'primary'} w-full py-2! text-nowrap`}
                                    onClick={action.onClick}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </header>
            {children}
        </div>
    )
}

export default Page

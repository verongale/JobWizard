'use server' 

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function updateStatus (companyId, newStatus) {
    await prisma.company.update({
        where: {id : companyId }, 
        data: { status: newStatus},
    })
    revalidatePath(`${companyId}`)
    revalidatePath('/companies')
    revalidatePath('/board')
} 

export async function updateNotes (companyId, newNotes) {
    await prisma.company.update({
        where: {id : companyId}, 
        data: { notes : newNotes || null },
        
    })

    revalidatePath(`${companyId}`)
}

export async function toggleKanban(companyId, inKanban) {
  await prisma.company.update({
    where: { id: companyId },
    data: { inKanban },
  })
  revalidatePath(`/companies/${companyId}`)
  revalidatePath('/companies')
  revalidatePath('/')
}






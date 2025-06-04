import { NextRequest, NextResponse } from 'next/server';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configure pdfMake avec les fontes
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

export async function POST(request: NextRequest) {
  try {
    // Récupère et vérifie les données du formulaire
    const formData = await request.json();
    if (
      !formData.step1 ||
      !formData.step2 ||
      !formData.step3 ||
      typeof formData.step1 !== 'object' ||
      typeof formData.step2 !== 'object' ||
      typeof formData.step3 !== 'object'
    ) {
      return NextResponse.json(
        { message: 'Données de formulaire invalides' },
        { status: 400 }
      );
    }

    // Construction du document PDF
    const documentDefinition = {
      content: [
        { text: 'Plan de Prévention', style: 'header' },
        { text: 'Identification des parties', style: 'subheader' },
        { text: `Partie 1 Nom : ${formData.step1.party1Name || ''}` },
        { text: `Partie 1 Rôle : ${formData.step1.party1Role || ''}` },
        { text: `Partie 2 Nom : ${formData.step1.party2Name || ''}` },
        { text: `Partie 2 Rôle : ${formData.step1.party2Role || ''}` },
        { text: 'Identification des risques', style: 'subheader' },
        { text: `Description du risque 1 : ${formData.step2.risk1Description || ''}` },
        { text: `Évaluation du risque 1 : ${formData.step2.risk1Assessment || ''}` },
        { text: 'Commentaires', style: 'subheader' },
        { text: formData.step3.comments || '' },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
      defaultStyle: {
        fontSize: 12,
      },
      pageMargins: [40, 60, 40, 60],
    };

    // Création du PDF en mémoire
    const pdfDoc = pdfMake.createPdf(documentDefinition);

    // Obtient le Buffer du PDF
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });

    // Préparation des en-têtes pour forcer le téléchargement
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'application/pdf');
    responseHeaders.set(
      'Content-Disposition',
      'attachment; filename="plan-de-prevention.pdf"'
    );

    // Renvoi du PDF
    return new NextResponse(pdfBuffer, { headers: responseHeaders });
  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF :', error);
    return NextResponse.json(
      { message: 'Échec de la génération du PDF', error: error.message },
      { status: 500 }
    );
  }
}
Adopter
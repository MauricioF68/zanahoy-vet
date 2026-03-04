<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historial Clínico - {{ $pet->name }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; font-size: 14px; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #1e293b; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0 0 0; color: #64748b; }
        
        .pet-info { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f8fafc; }
        .pet-info th, .pet-info td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        .pet-info th { background-color: #e2e8f0; width: 25%; color: #475569; }

        .record { margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
        .record-header { background-color: #4f46e5; color: white; padding: 10px 15px; font-weight: bold; }
        .record-body { padding: 15px; }
        
        .field { margin-bottom: 15px; }
        .field-title { font-weight: bold; font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .field-content { margin: 0; background: #f1f5f9; padding: 8px; border-radius: 4px; border-left: 3px solid #94a3b8; }
        
        .prescription { border-left-color: #3b82f6; background-color: #eff6ff;}
        .instructions { border-left-color: #22c55e; background-color: #f0fdf4;}
        
        .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Centro Veterinario Zanahoy</h1>
        <p>Expediente Clínico Oficial</p>
    </div>

    <table class="pet-info">
        <tr>
            <th>Paciente:</th>
            <td><strong>{{ $pet->name }}</strong> ({{ ucfirst($pet->type) }})</td>
            <th>Raza:</th>
            <td>{{ $pet->breed }}</td>
        </tr>
        <tr>
            <th>Dueño / Tutor:</th>
            <td>{{ $pet->user->name }}</td>
            <th>Fecha de Emisión:</th>
            <td>{{ date('d/m/Y') }}</td>
        </tr>
    </table>

    <h2 style="color: #1e293b; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Historial de Atenciones</h2>

    @forelse($pet->triages as $triage)
        <div class="record">
            <div class="record-header">
                Fecha: {{ $triage->created_at->format('d/m/Y H:i') }} | Médico: Dr(a). {{ $triage->expert->name ?? 'Clínica' }}
            </div>
            <div class="record-body">
                <div class="field">
                    <div class="field-title">Diagnóstico Presuntivo</div>
                    <div class="field-content" style="border-left-color: #4f46e5; font-weight: bold;">
                        {{ $triage->presumptive_diagnosis ?? 'No especificado' }}
                    </div>
                </div>

                @if($triage->anamnesis)
                <div class="field">
                    <div class="field-title">Anamnesis / Observaciones</div>
                    <div class="field-content">{{ $triage->anamnesis }}</div>
                </div>
                @endif

                @if($triage->prescription)
                <div class="field">
                    <div class="field-title">Receta Médica</div>
                    <div class="field-content prescription">{!! nl2br(e($triage->prescription)) !!}</div>
                </div>
                @endif

                @if($triage->medical_instructions)
                <div class="field">
                    <div class="field-title">Cuidados Generales</div>
                    <div class="field-content instructions">{!! nl2br(e($triage->medical_instructions)) !!}</div>
                </div>
                @endif
            </div>
        </div>
    @empty
        <p style="text-align: center; color: #94a3b8;">No hay atenciones médicas registradas.</p>
    @endforelse

    <div class="footer">
        Documento generado automáticamente por el sistema ERP Médico Zanahoy. <br>
        La información contenida es confidencial y de uso exclusivo médico-paciente.
    </div>

</body>
</html>
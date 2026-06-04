export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;

  if (!CLICKUP_TOKEN) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas.' });
  }

  const {
    taskName, description, condoOptionId,
    listId, comunidadFieldId, priority,
    assigneeId, accountNumber, callDate,
    email1, email2, adminEmail, adminName, notes,
  } = req.body;

  const LIST_ID            = listId           || '901327231494';
  const COMUNIDAD_FIELD_ID = comunidadFieldId || 'd31fa9e3-02d9-4dff-87bb-834c70155d2e';
  const ACCOUNT_FIELD_ID   = '9cf5e959-705b-4482-84f2-19ba5192fbb0';
  const EMAIL1_FIELD_ID    = '66fbb335-d5cd-46fb-9f5c-72d47754899b';
  const EMAIL2_FIELD_ID    = '3e9f7722-3e18-4c4f-a196-f2ca2adf570b';
  const DATE_FIELD_ID      = 'PENDING_DATE_FIELD_ID';
  const ADMIN_NAME_ID      = '37ec5454-251b-458d-b0d6-978131558a88';
  const ADMIN_EMAIL_ID     = '87438049-cfba-4c55-858f-ff10fe5f6629';
  const NOTES_FIELD_ID     = '564b10cc-fb58-451b-aae4-cff5f12b5282';

  try {
    const cuPayload = {
      name: taskName,
      markdown_description: description,
      priority: priority === 'urgent' ? 1
               : priority === 'high'   ? 2
               : priority === 'normal' ? 3
               : 4,
      assignees: assigneeId ? [parseInt(assigneeId)] : [],
      custom_fields: [
        ...(condoOptionId ? [{ id: COMUNIDAD_FIELD_ID, value: condoOptionId }] : []),
        ...(accountNumber ? [{ id: ACCOUNT_FIELD_ID, value: accountNumber }] : []),
        ...(email1        ? [{ id: EMAIL1_FIELD_ID, value: email1 }] : []),
        ...(email2        ? [{ id: EMAIL2_FIELD_ID, value: email2 }] : []),
        ...(adminName  ? [{ id: ADMIN_NAME_ID,  value: adminName  }] : []),
        ...(adminEmail ? [{ id: ADMIN_EMAIL_ID, value: adminEmail }] : []),
        ...(notes ? [{ id: NOTES_FIELD_ID, value: notes }] : []),
        ...(callDate && DATE_FIELD_ID !== 'PENDING_DATE_FIELD_ID'
            ? [{ id: DATE_FIELD_ID, value: new Date(callDate).getTime() }] : []),
      ],
    };

    const cuRes = await fetch(
      `https://api.clickup.com/api/v2/list/${LIST_ID}/task`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CLICKUP_TOKEN,
        },
        body: JSON.stringify(cuPayload),
      }
    );

    const cuData = await cuRes.json();

    if (!cuRes.ok) {
      return res.status(502).json({ error: cuData.err || 'Error en ClickUp', detail: cuData });
    }

    return res.status(200).json({ success: true, task_id: cuData.id, task_url: cuData.url });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

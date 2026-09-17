/**
 * JoinMe Studio Basic Widgets Creator
 */
export function getBasicWidget(nodeType, newWidget, timestamp) {
  switch (nodeType) {
    case 'container':
      newWidget.children = [];
      newWidget.style = {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 12,
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.02)',
        width: '100%',
        margin: '0px 0px 12px 0px'
      };
      break;

    case 'heading':
      newWidget.content = 'Judul Baru';
      newWidget.style = { fontSize: 24, color: '#e36397', textAlign: 'center', fontFamily: 'Playfair Display', fontWeight: 'bold' };
      break;

    case 'text':
      newWidget.content = 'Teks responsif mengalir dinamis mengikuti grid flexbox.';
      newWidget.style = { fontSize: 13, color: '#4a5568', textAlign: 'center', fontFamily: 'Inter' };
      break;

    case 'image':
      newWidget.content = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80';
      newWidget.showInGallery = false;
      newWidget.style = { width: '100%', borderRadius: 8, height: 'auto' };
      break;

    case 'divider':
      newWidget.style = { borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', width: '100%', margin: '12px 0px' };
      break;

    case 'spacer':
      newWidget.style = { height: 24, width: '100%' };
      break;

    default:
      return null;
  }
  return newWidget;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const demoData = [
    {
      id: 'demo-1',
      original_text: 'Welcome to Our App',
      edited_text: '',
      frame_name: 'Landing Page',
      component_path: 'MainFrame/Header/Title',
      context_notes: 'Font: Inter, Size: 32px, Position: (120, 80)',
      image: ''
    },
    {
      id: 'demo-2',
      original_text: 'Get started today',
      edited_text: '',
      frame_name: 'Landing Page',
      component_path: 'MainFrame/CTASection/Button',
      context_notes: 'Font: Inter, Size: 16px, Position: (200, 300)',
      image: ''
    },
    {
      id: 'demo-3',
      original_text: 'Join thousands of users who trust our platform',
      edited_text: '',
      frame_name: 'Landing Page',
      component_path: 'MainFrame/CTASection/Subtitle',
      context_notes: 'Font: Inter, Size: 18px, Position: (150, 250)',
      image: ''
    },
    {
      id: 'demo-4',
      original_text: 'Learn More',
      edited_text: '',
      frame_name: 'About Page',
      component_path: 'AboutFrame/InfoSection/LinkButton',
      context_notes: 'Font: Inter, Size: 14px, Position: (300, 400)',
      image: ''
    }
  ];

  res.status(200).json({
    success: true,
    data: demoData,
    message: `Demo data with ${demoData.length} text elements`
  });
}
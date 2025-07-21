export default function handler(req, res) {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Prototype Text Review Tool API is running',
    timestamp: new Date().toISOString()
  });
}
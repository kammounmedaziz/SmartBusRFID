import { useEffect, useState } from 'react';
import api from '../../utils/apiClient';
import CardItem from './CardItem';

const ActiveCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await api.getMyCards(token);
      setCards(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) return <div>Loading cards...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      {cards.length === 0 ? (
        <div className="text-gray-400">No active cards found.</div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <CardItem key={card.id} card={card} onUpdated={fetchCards} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveCards;

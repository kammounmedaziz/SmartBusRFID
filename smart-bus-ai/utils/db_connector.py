"""
Database connector for AI service
Connects to MariaDB to fetch transaction data for predictions
"""

import pymysql
import logging
from typing import List, Dict, Optional
from contextlib import contextmanager
import os

logger = logging.getLogger(__name__)

class DBConnector:
    def __init__(self, 
                 host: str = "localhost",
                 port: int = 3306,
                 user: str = "root",
                 password: str = "",
                 database: str = "smart_bus_db"):
        """
        Initialize database connector
        
        Args:
            host: Database host
            port: Database port
            user: Database user
            password: Database password
            database: Database name
        """
        self.config = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
        
        logger.info(f"Database connector initialized for {database}@{host}")
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections
        
        Yields:
            Database connection
        """
        connection = None
        try:
            connection = pymysql.connect(**self.config)
            yield connection
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            raise
        finally:
            if connection:
                connection.close()
    
    def get_card_statistics(self, card_id: int) -> Optional[Dict]:
        """
        Get usage statistics for a card
        
        Args:
            card_id: Card ID
            
        Returns:
            Dictionary with card statistics
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Get card info
                    cursor.execute("""
                        SELECT 
                            c.card_id,
                            c.balance,
                            u.full_name as user_name,
                            c.created_at
                        FROM cards c
                        LEFT JOIN users u ON c.user_id = u.user_id
                        WHERE c.card_id = %s
                    """, (card_id,))
                    
                    card_info = cursor.fetchone()
                    
                    if not card_info:
                        return None
                    
                    # Get transaction statistics
                    cursor.execute("""
                        SELECT 
                            COUNT(*) as transaction_count,
                            AVG(amount) as avg_transaction,
                            SUM(amount) as total_spent,
                            MAX(created_at) as last_transaction
                        FROM transactions
                        WHERE card_id = %s
                        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    """, (card_id,))
                    
                    stats = cursor.fetchone()
                    
                    # Get last recharge
                    cursor.execute("""
                        SELECT 
                            amount,
                            created_at
                        FROM manual_payments
                        WHERE card_id = %s
                        AND status = 'approved'
                        ORDER BY created_at DESC
                        LIMIT 1
                    """, (card_id,))
                    
                    last_recharge = cursor.fetchone()
                    
                    # Calculate days since recharge
                    days_since_recharge = 30  # Default
                    if last_recharge:
                        cursor.execute("""
                            SELECT DATEDIFF(NOW(), %s) as days
                        """, (last_recharge['created_at'],))
                        result = cursor.fetchone()
                        days_since_recharge = result['days']
                    
                    # Calculate average daily spend
                    total_spent = stats['total_spent'] or 0
                    transaction_count = stats['transaction_count'] or 0
                    avg_daily_spend = total_spent / 30 if total_spent > 0 else 0
                    
                    return {
                        'card_id': card_info['card_id'],
                        'balance': float(card_info['balance']),
                        'user_name': card_info['user_name'],
                        'transaction_count': transaction_count,
                        'avg_daily_spend': float(avg_daily_spend),
                        'days_since_recharge': days_since_recharge,
                        'total_spent_30d': float(total_spent),
                        'last_transaction': stats['last_transaction']
                    }
                    
        except Exception as e:
            logger.error(f"Error getting card statistics: {str(e)}")
            return None
    
    def get_all_active_cards(self) -> List[Dict]:
        """
        Get statistics for all active cards
        
        Returns:
            List of card statistics
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Get all active cards
                    cursor.execute("""
                        SELECT card_id 
                        FROM cards 
                        WHERE status = 'active'
                    """)
                    
                    cards = cursor.fetchall()
                    
                    # Get statistics for each card
                    card_stats = []
                    for card in cards:
                        stats = self.get_card_statistics(card['card_id'])
                        if stats:
                            card_stats.append(stats)
                    
                    return card_stats
                    
        except Exception as e:
            logger.error(f"Error getting all active cards: {str(e)}")
            return []
    
    def get_low_balance_cards(self, threshold: float = 5000) -> List[Dict]:
        """
        Get cards with balance below threshold
        
        Args:
            threshold: Balance threshold
            
        Returns:
            List of low balance cards
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            c.card_id,
                            c.card_number,
                            c.balance,
                            u.full_name,
                            u.email,
                            u.phone_number
                        FROM cards c
                        LEFT JOIN users u ON c.user_id = u.user_id
                        WHERE c.status = 'active'
                        AND c.balance < %s
                        ORDER BY c.balance ASC
                    """, (threshold,))
                    
                    return cursor.fetchall()
                    
        except Exception as e:
            logger.error(f"Error getting low balance cards: {str(e)}")
            return []
    
    def get_training_data(self, days: int = 90) -> List[Dict]:
        """
        Get historical data for model training
        
        Args:
            days: Number of days of history
            
        Returns:
            List of training samples
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Get cards that went below 1000 RWF
                    cursor.execute("""
                        SELECT DISTINCT card_id
                        FROM transactions
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                    """, (days,))
                    
                    cards = cursor.fetchall()
                    
                    training_data = []
                    
                    for card in cards:
                        card_id = card['card_id']
                        stats = self.get_card_statistics(card_id)
                        
                        if stats:
                            # Label as high risk if balance < 5000
                            risk_label = 1 if stats['balance'] < 5000 else 0
                            
                            training_data.append({
                                **stats,
                                'risk_label': risk_label
                            })
                    
                    return training_data
                    
        except Exception as e:
            logger.error(f"Error getting training data: {str(e)}")
            return []
    
    def test_connection(self) -> bool:
        """
        Test database connection
        
        Returns:
            True if connection successful
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    return result is not None
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False


# Singleton instance
_db_connector = None

def get_db_connector(config: Optional[Dict] = None) -> DBConnector:
    """
    Get database connector singleton
    
    Args:
        config: Optional database configuration
        
    Returns:
        DBConnector instance
    """
    global _db_connector
    
    if _db_connector is None:
        if config:
            _db_connector = DBConnector(**config)
        else:
            # Use environment variables or defaults
            _db_connector = DBConnector(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 3306)),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_NAME', 'smart_bus_db')
            )
    
    return _db_connector

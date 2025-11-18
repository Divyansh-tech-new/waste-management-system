from pymongo import MongoClient
from bson.objectid import ObjectId

client = MongoClient('mongodb+srv://divyansh4078233:Mayanegi@cluster0.spb1r.mongodb.net/waste-management')
db = client['waste-management']

# Set the latest feed to live
result = db.camerafeeds.update_one(
    {'_id': ObjectId('69126cc0eac0cd7186e0b392')},
    {'$set': {'isLive': True}}
)

print(f'Updated {result.modified_count} document to isLive=True')
print('Camera feed is now live!')

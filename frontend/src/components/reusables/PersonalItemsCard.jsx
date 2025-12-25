import React from 'react'
import { useSelector } from 'react-redux';
import { Card } from '../ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const PersonalItemsCard = ({item,type}) => {
  const navigate=useNavigate();
  let id , path ;
  if(type === "lost") {
    id = item.lost_item_id
    path = `/item-found-claims/${id}`
  }
  else{
    id = item.found_item_id
    path = `/item-claims/${id}`
  } 
  return (
      <Card key={id} className="overflow-hidden">
        <div className="flex">
          <img src={item.photos[0]} alt={item.name} className="h-24 w-24 object-cover" />
          <div className="p-4 flex-1">
            <div className="flex justify-between">
              <h3 className="font-medium">{item.name}</h3>
              <Badge variant="success">{item.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{type=="lost"?item.lost_location:item.found_location}</p>
            <div className="flex gap-3 items-center mt-2">
              <span className="text-xs text-gray-500">{new Date(type=="lost"?item.lost_date:item.found_date).toLocaleDateString()}</span>
              <div className="flex gap-6 justify-between items-center mt-2">
                    <Button
                      onClick={()=>{
                        navigate(path)
                      }}
                      variant="link"
                      size="xs"
                      className="h-auto p-0"
                    >Claims</Button>
                    <Button
                      onClick={() => {
                        const path = type === "lost"
                          ? `/my-lost-items/${item.lost_item_id}`
                          : `/my-found-items/${id}`;
                        navigate(path);
                      }}
                        variant="link"
                        size="xs"
                        className="h-auto p-0"
                    >View Details
                    </Button>
              </div>              
            </div>
          </div>
        </div>
      </Card>
  )
}

export default PersonalItemsCard

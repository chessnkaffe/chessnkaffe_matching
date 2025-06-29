import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
// import { Label } from "../../components/ui/label";
// import { Input } from "../../components/ui/input";
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from "../../components/ui/select";
import { Button } from "../../components/ui/button";

type ChessSetProvider = 'self' | 'cafe' | 'opponent';

// interface MatchAcceptanceDetails {
//   cafeAddress: string;
//   meetingTime: string;
//   chessSetProvider: ChessSetProvider;
//   contactInfo: string;
// }

type AcceptMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void; // Simplified - no longer accepting details
  // onAccept: (details: MatchAcceptanceDetails) => void;
  matchDetails: {
    date: string;
    timeWindow: {
      start: string;
      end: string;
    };
    area: string;
  };
  meetupDetails: {
    cafeAddress: string;
    meetingTime: string;
    meetingEndTime: string;
    chessSetProvider: ChessSetProvider;
    comments?: string;
  };
}

const AcceptMatchModal = ({
  isOpen,
  onClose,
  onAccept,
  matchDetails,
  meetupDetails
}: AcceptMatchModalProps) => {
  // const [formData, setFormData] = useState<MatchAcceptanceDetails>({
  //   cafeAddress: '',
  //   meetingTime: '',
  //   chessSetProvider: 'self',
  //   contactInfo: ''
  // });
  // Display chess set provider text
  const getChessSetProviderText = (provider: ChessSetProvider): string => {
    switch(provider) {
      case 'self': return 'You will bring the chess set';
      case 'cafe': return 'The café provides the chess set';
      case 'opponent': return 'Your opponent will bring the chess set';
      default: return '';
    }

  // const [errors, setErrors] = useState<Partial<Record<keyof MatchAcceptanceDetails, string>>>({});

  // const validateForm = (): boolean => {
  //   const newErrors: Partial<Record<keyof MatchAcceptanceDetails, string>> = {};
    
  //   if (!formData.cafeAddress.trim()) {
  //     newErrors.cafeAddress = 'Café address is required';
  //   }
    
  //   if (!formData.meetingTime) {
  //     newErrors.meetingTime = 'Meeting time is required';
  //   } else {
  //     const selectedTime = formData.meetingTime;
  //     if (selectedTime < matchDetails.timeWindow.start || selectedTime > matchDetails.timeWindow.end) {
  //       newErrors.meetingTime = 'Time must be within the specified window';
  //     }
  //   }
    
  //   if (!formData.contactInfo.trim()) {
  //     newErrors.contactInfo = 'Contact information is required';
  //   }
    
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const handleSubmit = () => {
  //   if (validateForm()) {
  //     onAccept(formData);
  //     onClose();
  //   }
  // };

  // const handleSelectChange = (value: ChessSetProvider) => {
  //   setFormData({
  //     ...formData,
  //     chessSetProvider: value
  //   });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Accept Chess Match</DialogTitle>
          <DialogDescription>
            Review the details for your chess meetup. The match is scheduled for {new Date(matchDetails.date).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Café Address:</div>
            <div className="col-span-3">{meetupDetails.cafeAddress}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Meeting Time:</div>
            <div className="col-span-3">
              {meetupDetails.meetingTime} - {meetupDetails.meetingEndTime}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-semibold text-right">Chess Set:</div>
            <div className="col-span-3">
              {getChessSetProviderText(meetupDetails.chessSetProvider)}
            </div>
          </div>
          
          {meetupDetails.comments && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="font-semibold text-right">Comments:</div>
              <div className="col-span-3">{meetupDetails.comments}</div>
            </div>
          )}
        </div>

        {/* <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="cafeAddress">Café Address</Label>
            <Input
              id="cafeAddress"
              type="text"
              value={formData.cafeAddress}
              onChange={(e) => setFormData({ ...formData, cafeAddress: e.target.value })}
              placeholder="Enter the café address"
              aria-describedby="cafeAddress-error"
            />
            {errors.cafeAddress && (
              <span id="cafeAddress-error" className="text-sm text-red-500">
                {errors.cafeAddress}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meetingTime">Meeting Time</Label>
            <Input
              id="meetingTime"
              type="time"
              value={formData.meetingTime}
              onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              min={matchDetails.timeWindow.start}
              max={matchDetails.timeWindow.end}
              aria-describedby="meetingTime-error"
            />
            {errors.meetingTime && (
              <span id="meetingTime-error" className="text-sm text-red-500">
                {errors.meetingTime}
              </span>
            )}
            <span className="text-sm text-gray-500">
              Available between {matchDetails.timeWindow.start} and {matchDetails.timeWindow.end}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="chessSet">Chess Set Provider</Label>
            <Select 
              value={formData.chessSetProvider}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="chessSet">
                <SelectValue placeholder="Who's bringing the chess set?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">I'll bring it</SelectItem>
                <SelectItem value="cafe">The café provides it</SelectItem>
                <SelectItem value="opponent">My opponent will bring it</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              type="text"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Your phone number or preferred contact method"
              aria-describedby="contactInfo-error"
            />
            {errors.contactInfo && (
              <span id="contactInfo-error" className="text-sm text-red-500">
                {errors.contactInfo}
              </span>
            )}
          </div>
        </div> */}

        <DialogFooter className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Decline
          </Button>
          <Button onClick={onAccept}>
            Confirm Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AcceptMatchModal;
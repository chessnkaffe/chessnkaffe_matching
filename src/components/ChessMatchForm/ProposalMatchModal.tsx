// src/components/ChessMatchForm/ProposalMatchModal.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Button } from "../ui/button";
import { copenhagenCafes } from "../../utils/cafeData";

type ChessSetProvider = 'self' | 'cafe' | 'opponent';

interface MatchProposalDetails {
  cafeAddress: string;
  meetingTime: string;
  meetingEndTime: string;
  chessSetProvider: ChessSetProvider;
  comments: string;
}

type ProposalMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSend: (details: MatchProposalDetails) => void;
  matchDetails: {
    date: string;
    timeWindow: {
      start: string;
      end: string;
    };
    area: string;
  };
}

const ProposalMatchModal = ({
  isOpen,
  onClose,
  onSend,
  matchDetails
}: ProposalMatchModalProps) => {
  const [formData, setFormData] = useState<MatchProposalDetails>({
    cafeAddress: '',
    meetingTime: '',
    meetingEndTime: '',
    chessSetProvider: 'self',
    comments: ''
  });

  const [filteredCafes, setFilteredCafes] = useState(copenhagenCafes);
  const [selectedCafeId, setSelectedCafeId] = useState<string>('');
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof MatchProposalDetails, string>>>({});

  useEffect(() => {
    if (matchDetails.area) {
      const areaPostalCode = matchDetails.area.split(' ')[0];
      const cafesInArea = copenhagenCafes.filter(cafe => 
        cafe.neighborhood.includes(areaPostalCode)
      );
      setFilteredCafes(cafesInArea.length > 0 ? cafesInArea : copenhagenCafes);
    } else {
      setFilteredCafes(copenhagenCafes);
    }
  }, [matchDetails.area]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MatchProposalDetails, string>> = {};
    
    if (!formData.cafeAddress.trim()) {
      newErrors.cafeAddress = 'Café address is required';
    }
    
    if (!formData.meetingTime) {
      newErrors.meetingTime = 'Meeting start time is required';
    } else {
      const selectedTime = formData.meetingTime;
      if (selectedTime < matchDetails.timeWindow.start || selectedTime > matchDetails.timeWindow.end) {
        newErrors.meetingTime = 'Time must be within the specified window';
      }
    }
    
    if (!formData.meetingEndTime) {
      newErrors.meetingEndTime = 'Meeting end time is required';
    } else if (formData.meetingTime && formData.meetingEndTime <= formData.meetingTime) {
      newErrors.meetingEndTime = 'End time must be after start time';
    }
    
    if (formData.comments && formData.comments.length > 150) {
      newErrors.comments = 'Comments must be 150 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSend(formData);
      onClose();
    }
  };

  const handleCafeSelect = (cafeId: string) => {
    setSelectedCafeId(cafeId);
    
    if (cafeId === 'custom') {
      setIsCustomAddress(true);
      setFormData({
        ...formData,
        cafeAddress: ''
      });
    } else {
      setIsCustomAddress(false);
      const selectedCafe = copenhagenCafes.find(cafe => cafe.id === cafeId);
      if (selectedCafe) {
        setFormData({
          ...formData,
          cafeAddress: `${selectedCafe.name}, ${selectedCafe.address}`
        });
      }
    }
  };

  const handleSelectChange = (value: ChessSetProvider) => {
    setFormData({
      ...formData,
      chessSetProvider: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Propose Chess Match</DialogTitle>
          <DialogDescription>
            Set up the details for your chess meetup. The match is scheduled for {new Date(matchDetails.date).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Café Selection */}
          <div className="grid gap-2">
            <Label htmlFor="cafeSelect">Café Selection</Label>
            <Select onValueChange={handleCafeSelect} value={selectedCafeId}>
              <SelectTrigger id="cafeSelect">
                <SelectValue placeholder="Select a café" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {filteredCafes.map(cafe => (
                  <SelectItem 
                    key={cafe.id} 
                    value={cafe.id}
                    className="hover:bg-gray-100 cursor-pointer py-2"
                  >
                    <span className="font-medium">{cafe.name}</span> - <span className="text-gray-500">{cafe.neighborhood}</span>
                  </SelectItem>
                ))}
                <SelectItem 
                  value="custom"
                  className="hover:bg-gray-100 cursor-pointer py-2"
                >
                  <span className="font-medium">Another Café</span> - <span className="text-gray-500">Enter custom address</span>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              id="cafeAddress"
              type="text"
              value={formData.cafeAddress}
              onChange={(e) => setFormData({ ...formData, cafeAddress: e.target.value })}
              placeholder={isCustomAddress ? "Enter café address" : "Café address will appear here"}
              readOnly={!isCustomAddress}
              className={isCustomAddress ? "" : "bg-gray-50 cursor-not-allowed"}
              aria-describedby="cafeAddress-error"
            />
            {errors.cafeAddress && (
              <span id="cafeAddress-error" className="modal-error-text">
                {errors.cafeAddress}
              </span>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="meetingTime">Start Time</Label>
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
                <span id="meetingTime-error" className="modal-error-text">
                  {errors.meetingTime}
                </span>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="meetingEndTime">End Time</Label>
              <Input
                id="meetingEndTime"
                type="time"
                value={formData.meetingEndTime}
                onChange={(e) => setFormData({ ...formData, meetingEndTime: e.target.value })}
                min={formData.meetingTime || matchDetails.timeWindow.start}
                max={matchDetails.timeWindow.end}
                aria-describedby="meetingEndTime-error"
              />
              {errors.meetingEndTime && (
                <span id="meetingEndTime-error" className="modal-error-text">
                  {errors.meetingEndTime}
                </span>
              )}
            </div>
          </div>
          
          <span className="modal-helper-text">
            Available between {matchDetails.timeWindow.start} and {matchDetails.timeWindow.end}
          </span>

          {/* Chess Set Provider */}
          <div className="grid gap-2">
            <Label htmlFor="chessSet">Chess Set Provider</Label>
            <Select 
              value={formData.chessSetProvider}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="chessSet">
                <SelectValue placeholder="Who's bringing the chess set?" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="self" className="hover:bg-gray-100 cursor-pointer py-2">I'll bring it</SelectItem>
                <SelectItem value="cafe" className="hover:bg-gray-100 cursor-pointer py-2">The café provides it</SelectItem>
                <SelectItem value="opponent" className="hover:bg-gray-100 cursor-pointer py-2">My opponent will bring it</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comments */}
          <div className="grid gap-2">
            <Label htmlFor="comments">Comments (optional)</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Add any comments (max 150 characters)"
              maxLength={150}
              className="resize-none"
              aria-describedby="comments-error"
            />
            {errors.comments && (
              <span id="comments-error" className="modal-error-text">
                {errors.comments}
              </span>
            )}
            <div className="text-xs text-gray-500 text-right">
              {formData.comments.length}/150
            </div>
          </div>
        </div>

        <DialogFooter className="modal-button-group">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="modal-button-cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="modal-button-submit"
          >
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalMatchModal;
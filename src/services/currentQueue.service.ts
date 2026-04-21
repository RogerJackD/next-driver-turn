import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PeerExitDto {
  expulsionReasonId: number;
  observations?: string;
}

interface PeerExitResponse {
  message: string;
  stopId: number;
}

export const currentQueueService = {
  peerExit: async (queueId: number, data: PeerExitDto): Promise<PeerExitResponse> => {
    const response = await fetch(`${API_BASE_URL}/current-queue/${queueId}/peer-exit`, {
      method: 'POST',
      headers: authUtils.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Error: ${response.status}`);
    }
    return response.json();
  },
};

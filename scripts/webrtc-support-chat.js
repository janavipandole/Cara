/**
 * Mock WebRTC Customer Support Chat
 * Simulates the establishment of a Peer-to-Peer video/audio connection 
 * between a customer and a support agent using STUN/TURN servers.
 */

export class WebRTCSupportManager {
  constructor(signalingServerUrl) {
    this.signalingServerUrl = signalingServerUrl;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    
    // Standard public STUN servers for NAT traversal
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initializes media devices (camera/microphone).
   */
  async initializeLocalStream(videoElementId) {
    try {
      console.log('[WebRTC] Requesting media permissions...');
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const localVideoElement = document.getElementById(videoElementId);
      if (localVideoElement) {
        localVideoElement.srcObject = this.localStream;
      }
      
      console.log('[WebRTC] Local media stream initialized successfully.');
    } catch (error) {
      console.error('[WebRTC] Failed to access media devices:', error);
      throw new Error('Camera/Microphone permissions denied or hardware unavailable.');
    }
  }

  /**
   * Sets up the RTCPeerConnection and handles ICE candidates.
   */
  setupPeerConnection(remoteVideoElementId) {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Add local tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received.');
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        const remoteVideoElement = document.getElementById(remoteVideoElementId);
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = this.remoteStream;
        }
      }
      this.remoteStream.addTrack(event.track);
    };

    // Handle ICE candidates negotiation (Mocking signaling)
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate generated. Sending to signaling server...');
        this.mockSendToSignalingServer('ice-candidate', event.candidate);
      }
    };
  }

  /**
   * Initiates a call by creating an offer.
   */
  async initiateCall(remoteVideoElementId) {
    console.log('[WebRTC] Initiating call to support agent...');
    this.setupPeerConnection(remoteVideoElementId);

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('[WebRTC] Offer created. Sending to signaling server...');
      this.mockSendToSignalingServer('video-offer', offer);
      
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
    }
  }

  /**
   * Simulates sending data to a WebSocket signaling server.
   */
  mockSendToSignalingServer(type, payload) {
    // In reality, this uses a WebSocket connection to pass SDP and ICE candidates to the peer
    setTimeout(() => {
      console.log(`[Signaling Server Mock] Transmitted ${type} payload.`);
    }, 200);
  }

  /**
   * Terminates the connection and stops media tracks.
   */
  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    console.log('[WebRTC] Call ended gracefully.');
  }
}

// Usage Example for UI Integration:
// const rtcManager = new WebRTCSupportManager('wss://support.cara.local/signaling');
// 
// document.getElementById('start-support-call').addEventListener('click', async () => {
//   await rtcManager.initializeLocalStream('local-video-preview');
//   await rtcManager.initiateCall('remote-agent-video');
// });
// 
// document.getElementById('end-support-call').addEventListener('click', () => {
//   rtcManager.endCall();
// });

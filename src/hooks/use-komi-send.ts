const createSend = useCallback(
  async (recipientId: string, amount: number, description?: string): Promise<Send> => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Step 1: atomic wallet transfer via Postgres RPC
      await SendService.sendMoney(
        user.id,
        recipientId,
        amount,
        description
      );

      // DEBUG
      console.log('CREATE SEND STATUS = COMPLETED');

      // Step 2: create Transfer History record
      const send = await KomiSendService.createSend({
        senderId: user.id,
        recipientId,
        amount,
        status: 'completed',
        description,
      });

      console.log('CREATED SEND RECORD:', send);

      setSends((prev) => [send, ...prev]);

      return send;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to send money';

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  [user]
);
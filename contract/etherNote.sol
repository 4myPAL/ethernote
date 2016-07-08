contract EtherNote {
        address owner;
        struct DocPayment {
            string docHash;
            bool lenderPaid;
            bool borrowerPaid;
        }
        mapping(string => DocPayment) docs;

        function EtherNote() {
            owner = msg.sender;
        }
        function newDoc(string docId, string docHash) {
                if (msg.sender != owner) return;
                docs[docId] = DocPayment({docHash: docHash, lenderPaid: false, borrowerPaid: false});
        }
        function getDocHashById(string docId) constant returns(string) {
            return docs[docId].docHash;
        }
        function getLenderPayStatusById(string docId) constant returns(bool) {
            return docs[docId].lenderPaid;
        }
        function getBorrowerPayStatusById(string docId) constant returns(bool) {
            return docs[docId].borrowerPaid;
        }
        function sendEtherToOwner() { 
            if (msg.sender != owner) return;                 
            owner.send(this.balance);
        }
        function kill() {
            if (msg.sender != owner) return;
            selfdestruct(owner);   
        }
}